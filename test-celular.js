// Teste para entender o problema do celular
const testCelular = "(11) 55555-5555";
console.log('Celular original:', testCelular);
console.log('JSON.stringify:', JSON.stringify(testCelular));

const trimmed = testCelular.trim();
console.log('Trimmed:', trimmed);
console.log('JSON.stringify trimmed:', JSON.stringify(trimmed));

const numbers = trimmed.replace(/[^\d]/g, '');
console.log('Números extraídos:', numbers);
console.log('Comprimento:', numbers.length);

// Teste com regex
const celularRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
console.log('Regex test:', celularRegex.test(trimmed));

// Teste com FormData simulado
const formData = new FormData();
formData.append('celular', testCelular);

console.log('\n--- Teste FormData ---');
for (let [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
  console.log('JSON.stringify:', JSON.stringify(value));
  console.log('Números extraídos:', value.replace(/[^\d]/g, ''));
}


