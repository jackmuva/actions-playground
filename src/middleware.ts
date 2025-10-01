import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// In middleware auth mode, each page is protected by default.
// Exceptions are configured via the `unauthenticatedPaths` option.
export default authkitMiddleware({
	middlewareAuth: {
		enabled: true,
		unauthenticatedPaths: ["/", "/api/workflow/trigger"],
	},
});

// Match against pages and API routes that require authentication
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'] };
