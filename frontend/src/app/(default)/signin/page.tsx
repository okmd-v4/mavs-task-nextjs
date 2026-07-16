import Link from "next/link";
import LoginForm from "../../components/LoginForm";

export default function Signin() {
	return (
		<div className="authCard">
			<h2>サインイン</h2>
			<LoginForm />
			<p>
				アカウントをお持ちでない方は<Link href="/signup">こちら</Link>
			</p>
		</div>
	);
}
