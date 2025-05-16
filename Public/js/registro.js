document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("rol").value;

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, password, rol }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error en el registro");
        return;
      }

      alert(data.message || "Registro exitoso");

      // Redirigir tras registro exitoso (opcional)
      window.location.href = "/View/login.html";

    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error al conectarse al servidor");
    }
  });
});
