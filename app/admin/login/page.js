// /app/admin/login/page.js
import LoginForm from "../../../components/Auth/LoginForm";
import AuthLayout from "./layout"

export default function AdminLogin() {
  return (
    <AuthLayout>
      <LoginForm redirectTo="/admin/dashboard" title="Connexion au Back-Office" />
    </AuthLayout>
  );
}