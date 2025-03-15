"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { config, messageParser } from "./chatbotConfig";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TextareaAutosize } from "@mui/material";

// Schéma de validation Zod
const formSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  sujet: z.string().min(2, { message: "Le sujet doit contenir au moins 2 caractères." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
});

export default function Contact() {
  const [showChatbot, setShowChatbot] = useState(false);

  // Initialisation de react-hook-form avec validation Zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", sujet: "", message: "" },
  });

  // Fonction de soumission du formulaire
  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de l'envoi");
      toast.success("Message envoyé avec succès ! ✅", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      form.reset();
    } catch (error) {
      console.error("Erreur d'envoi :", error);
      toast.error("Erreur lors de l'envoi du message.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <>
      {/* Ajout du ToastContainer pour afficher les notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="relative w-full max-w-lg mx-auto mb-6 text-center">
        <p className="text-2xl font-bold py-10">Formulaire de contact</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Champ Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Votre email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Champ Sujet */}
          <FormField
            control={form.control}
            name="sujet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sujet du message</FormLabel>
                <FormControl>
                  <Input placeholder="Sujet du message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Champ Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <TextareaAutosize
                    {...field}
                    placeholder="Tapez votre message..."
                    minRows={3}
                    maxRows={7}
                    className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Bouton Submit */}
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Envoyer
            </Button>
          </div>
        </form>
      </Form>
      <div className="flex justify-center mt-4">
        <Button onClick={() => setShowChatbot(true)}>ContactMe (Chatbot)</Button>
      </div>
      {showChatbot && (
        <div className="fixed bottom-0 right-0 p-4 bg-white border rounded-lg shadow-lg">
          <Chatbot config={config} messageParser={messageParser} actionProvider={undefined} />
          <Button onClick={() => setShowChatbot(false)} className="mt-2">
            Fermer
          </Button>
        </div>
      )}
    </>
  );
}