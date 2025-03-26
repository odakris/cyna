export async function updateUserInfo(userData: { firstName: string; lastName: string; email: string }) {
    const response = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour des informations.");
    }
  
    return response.json();
  }
  