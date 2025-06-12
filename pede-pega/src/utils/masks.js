// Máscara para telefone (XX) XXXXX-XXXX
export const maskPhone = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara
  return limitedNumbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(\d{4})(\d)/, '$1');
};

// Máscara para número do cartão XXXX XXXX XXXX XXXX
export const maskCardNumber = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 16 dígitos
  const limitedNumbers = numbers.slice(0, 16);
  
  // Aplica a máscara
  return limitedNumbers
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1');
};

// Máscara para validade do cartão MM/AA
export const maskCardExpiry = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 4 dígitos
  const limitedNumbers = numbers.slice(0, 4);
  
  // Aplica a máscara
  return limitedNumbers
    .replace(/(\d{2})(\d)/, '$1/$2');
};

// Máscara para CVV (3 ou 4 dígitos)
export const maskCVV = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 4 dígitos
  return numbers.slice(0, 4);
};

// Função para remover máscaras
export const removeMask = (value) => {
  return value.replace(/\D/g, '');
}; 