import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: 'Ov23lispTKIbQ94lVRCl',
      clientSecret: '60f3979e3d812ea43b6b619ed53ef3c7854c3d83',
    }),
    GoogleProvider({
      clientId: "152096308332-5hcfg0dd14e51sn8r8s747eqem52dk2c.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };