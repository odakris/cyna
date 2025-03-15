import LoginForm from "../../../components/Auth/LoginForm";
import AuthLayout from "./layout";

// Définition des props pour le composant AdminLogin (facultatif ici, car aucune prop n'est passée)
interface AdminLoginProps {}

const AdminLogin: React.FC<AdminLoginProps> = () => {
  return (
    <AuthLayout>
      <LoginForm redirectTo="/admin/dashboard" title="Connexion au Back-Office" />
    </AuthLayout>
  );
};

export default AdminLogin;