import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "@/components/Auth/LoginForm"
import RegisterForm from "@/components/Auth/RegisterForm"

const AuthTabs = () => {
  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in duration-300">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#302082] mb-2 relative pb-2 inline-block">
          Bienvenue chez CYNA
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 text-sm">
          Connectez-vous ou créez un compte pour accéder à nos services
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-lg mb-4 bg-gray-100 p-1">
          <TabsTrigger
            value="login"
            className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Connexion
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Inscription
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-2">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register" className="mt-2">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AuthTabs
