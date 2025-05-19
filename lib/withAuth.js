import { getUserFromToken } from './auth';

export function withAuth(getServerSidePropsFunc) {
  return async (context) => {
    const token = context.req.cookies.token || '';
    const user = getUserFromToken(token);

    if (!user) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }

    // Llamar a la función original con user disponible
    const propsResult = await getServerSidePropsFunc?.(context, user);
    return {
      props: {
        user,
        ...(propsResult?.props || {}),
      },
    };
  };
}
