import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Usuario de prueba (en memoria)
const users = [
  {
    id: '1',
    email: 'mauricio@aiduxcare.ai',
    name: 'Mauricio Sobarzo',
    password: 'test1234', // En producción usar hash
  },
];

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find(user => 
          user.email === credentials.email && 
          user.password === credentials.password
        );

        if (user) {
          // No enviar el password al cliente
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
  },
}); 