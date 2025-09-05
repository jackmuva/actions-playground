import { createUser, getUser } from "@/db/queries";
import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
	async onSuccess(data) {
		const user = await getUser(data.user.email);
		if (!user || user.length === 0) {
			await createUser(
				data.user.email,
			);
			const req = await fetch(process.env.WEBHOOK_URL!, {
				method: "POST",
				body: JSON.stringify({
					email: data.user.email,
					name: `${data.user.firstName} ${data.user.lastName}`
				}),
				headers: { 'Content-Type': "application/json" }
			});
			console.log("webhook completed with: ", req.status);
		}
	},
});
