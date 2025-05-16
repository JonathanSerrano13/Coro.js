document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || "Error en inicio de sesión");
      return;
    }

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      // Redirige a página de eventos u otra según rol o necesidad
      window.location.href = "/View/Eventos.html";
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al conectarse al servidor");
  }
});