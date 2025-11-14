import { 
  S3Client, 
  PutObjectCommand , 
  HeadBucketCommand, 
  CreateBucketCommand,
  GetObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const { BUCKET_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_ENDPOINT } = process.env;

if (!BUCKET_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET_ENDPOINT) {
  throw new Error("Missing AWS S3 configuration in environment variables.");
}

const s3 = new S3Client({
  region: BUCKET_REGION,
  endpoint: BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function generatePresignedUrl({
  bucket,
  file,
  key,
}: {
  bucket: string;
  file: any;
  key?: string; // opcional, para subdiretórios
}): Promise<string> {
  bucket = 'bkt-'+bucket; // S3 não aceita barras no nome do bucket
  // 1. Valida tipo
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error("Tipo de arquivo não permitido");
  }

  // 2. Valida tamanho
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB) {
    throw new Error(`Arquivo maior que ${MAX_SIZE_MB} MB`);
  }


  try {
    // 1. Verifica se bucket existe
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`✅ Bucket já existe: ${bucket}`);
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 404) {
      // 2. Se não existe, cria
      console.log(`⚠️ Bucket não encontrado, criando: ${bucket}`);
      await s3.send(new CreateBucketCommand({
        Bucket: bucket,
        CreateBucketConfiguration: {
          LocationConstraint: BUCKET_REGION as import("@aws-sdk/client-s3").BucketLocationConstraint,
        },
      }));
      console.log(`✅ Bucket criado: ${bucket}`);
    } else {
      // Outro erro (ex: permissão negada)
      console.error("Erro ao verificar bucket:", err);
      throw err;
    }
  }

  // 3. Cria comando S3
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  console.log("✅ Comando S3 criado",command);

  await s3.send(command);
  console.log("✅ Arquivo enviado para o bucket");
  // 4. Retorna URL com expiração de 60s (mantido para compatibilidade)
  return await getSignedUrl(s3, command, { expiresIn: 60 });
}

/**
 * Faz upload de um arquivo para o Wasabi e retorna o nome do arquivo
 * @param bucket Nome do bucket (sem o prefixo 'bkt-')
 * @param file Arquivo a ser enviado
 * @param key Nome do arquivo (chave)
 * @returns Nome do arquivo (key) após upload bem-sucedido
 */
export async function uploadFileToWasabi({
  bucket,
  file,
  key,
}: {
  bucket: string;
  file: any;
  key: string;
}): Promise<string> {
  // Reutilizar a lógica de generatePresignedUrl mas retornar apenas o key
  await generatePresignedUrl({ bucket, file, key });
  return key;
}


export async function getFileUrl({  
  bucket,
  key,
}: {
  bucket: string;
  key: string; 
}): Promise<string> {
  bucket = 'bkt-'+bucket;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  // URL válida por 60 segundos
  return await getSignedUrl(s3, command, { expiresIn: 60 });
}

/**
 * Constrói a URL permanente de um arquivo no Wasabi
 * @param bucket Nome do bucket (sem o prefixo 'bkt-')
 * @param key Chave do arquivo (nome do arquivo)
 * @returns URL permanente do arquivo no Wasabi
 */
export function getPermanentFileUrl(bucket: string, key: string): string {
  // Remover barras do nome do bucket e adicionar prefixo
  const bucketName = 'bkt-' + bucket.replace('/', '_');
  
  // Construir URL permanente do Wasabi
  // Formato: https://{endpoint}/{bucket}/{key}
  const endpoint = BUCKET_ENDPOINT || '';
  
  // Remover protocolo se presente (https:// ou http://)
  const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
  
  // Construir URL completa
  const url = `https://${cleanEndpoint}/${bucketName}/${key}`;
  
  console.log(`🔗 URL permanente construída: ${url}`);
  return url;
}