import { NextResponse } from 'next/server';

export function middleware(request) {
  // Lista de rotas que requerem autenticação
  const rotasProtegidas = ['/carrinho', '/checkout', '/clientePedidos'];
  
  // Verifica se a rota atual requer autenticação
  const rotaAtual = request.nextUrl.pathname;
  const requerAutenticacao = rotasProtegidas.some(rota => rotaAtual.startsWith(rota));
  
  // Se a rota não requer autenticação, permite o acesso
  if (!requerAutenticacao) {
    return NextResponse.next();
  }
  
  // Verifica se o usuário está autenticado através do localStorage
  const authToken = request.cookies.get('authToken')?.value;
  
  // Se não há token e a rota requer autenticação, redireciona para o login
  if (!authToken) {
    const url = new URL('/FormLoginRegister', request.url);
    url.searchParams.set('redirect', rotaAtual);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configura quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    '/carrinho/:path*',
    '/checkout/:path*',
    '/clientePedidos/:path*',
  ],
}; 