let alimentos = {
  "Carne magra (1 bife chico 180g)": 35,
  "Chorizo (1 unidad chica)": 24,
  "Clara de huevo (1 unidad)": 4,
  "Empanada de carne o pollo o jamón y queso": 8,
  "Factura (1 unidad)": 4,
  "Fiambre (1 lonja de jamón)": 2.5,
  "Hamburguesa (tamaño comprada – 90g)": 18,
  "Helado de crema (1 bocha)": 3,
  "Huevo (1 unidad)": 7,
  "Legumbres (50g en crudo en cocido casi el doble)": 10,
  "Leche (1 vaso)": 6,
  "Licuado de fruta con leche (1 vaso)": 6,
  "Milanesa chica (60g tamaño peceto)": 12,
  "Milanesa de soja o lentejas (mediana 80g)": 7,
  "Milanesa grade (100g)": 20,
  "Muslo de pollo": 20,
  "Ñoquis de papa (25 unidades, plato mediano)": 6,
  "Ñoquis de ricota (25 unidades, plato mediano)": 8,
  "Pizza con queso (1 porción)": 10,
  "Pollo (½ pechuga)": 25,
  "Pollo (1 muslo)": 20,
  "Pollo (1 pata)": 16,
  "Pollo/cerdo/pescado/vaca (1 cda Sopera 30g)": 6,
  "Pescado (1 bife chico)": 30,
  "Queso de maquina (1 feta)": 3,
  "Queso fresco o cuartirolo (1 cajita de fósforos)": 8,
  "Queso postre (1 cajita de fósforos)": 12,
  "Queso rallado (2 cdas soperas no muy colmadas)": 20,
  "Queso untable descremado o semidescremado (2 cdas. soperas no muy colmadas)": 6,
  "Ravioles de verdura (16 unidades, plato mediano)": 7,
  "Yema de huevo (1 unidad)": 2,
  "Yogurt descremado o postre de leche (1 vaso o pote)": 6
};

let total = 0;
let subtotalCombinacion = 0;
let listaElegidos = [];
const listaEl = document.getElementById("lista");
const totalEl = document.getElementById("total");
const estadoEl = document.getElementById("estado");
const alimentoSel = document.getElementById("alimento");
const editor = document.getElementById("editor");

function cargarAlimentos() {
  alimentoSel.innerHTML = '';
  for (let key in alimentos) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${key} → ${alimentos[key]}g`;
    alimentoSel.appendChild(option);
  }
  editor.value = Object.entries(alimentos).map(([k, v]) => `${k}:${v}`).join("\n");
}

function agregarAlimento() {
  const nombre = alimentoSel.value;
  const proteinas = alimentos[nombre];
  listaElegidos.push({ nombre, proteinas });

  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center";
  li.innerHTML = `${nombre} <span class="badge bg-primary">${proteinas}g</span> <button class="btn btn-sm btn-danger ms-2" onclick="eliminarAlimento(this, ${proteinas})">Quitar</button>`;
  listaEl.appendChild(li);

  total += proteinas;
  subtotalCombinacion += proteinas;
  actualizarTotales();
  actualizarSubtotalCombinacion();
}

function eliminarAlimento(btn, proteinas) {
  total -= proteinas;
  subtotalCombinacion -= proteinas;
  btn.parentElement.remove();
  listaElegidos.pop();
  actualizarTotales();
  actualizarSubtotalCombinacion();
}

function actualizarTotales() {
  totalEl.textContent = total.toFixed(2);
  const limite = parseFloat(localStorage.getItem("limiteDiario") || "45");
  if (total > limite) {
    estadoEl.textContent = `¡Excedido por ${(total - limite).toFixed(2)}g!`;
    estadoEl.style.color = "red";
  } else {
    estadoEl.textContent = `Dentro del límite (${(limite - total).toFixed(2)}g restantes)`;
    estadoEl.style.color = "green";
  }
  guardarSubtotal();
}

function actualizarSubtotalCombinacion() {
  const subtotalEl = document.getElementById("subtotal-combinacion");
  subtotalEl.textContent = subtotalCombinacion.toFixed(2);
}

function actualizarLista() {
  const lineas = editor.value.split("\n");
  alimentos = {};
  for (let linea of lineas) {
    const partes = linea.split(":");
    if (partes.length === 2) {
      const nombre = partes[0].trim();
      const valor = parseFloat(partes[1]);
      if (!isNaN(valor)) {
        alimentos[nombre] = valor;
      }
    }
  }
  cargarAlimentos();
}

function guardarCombinacion() {
  const fecha = new Date().toLocaleString();
  const alimentosDetalle = listaElegidos.map(a => `${a.nombre} (${a.proteinas}g)`).join(", ");
  const fila = { fecha, subtotal: subtotalCombinacion, alimentos: alimentosDetalle };
  let historial = JSON.parse(localStorage.getItem("historialProteinas") || "[]");
  historial.push(fila);
  localStorage.setItem("historialProteinas", JSON.stringify(historial));
  mostrarHistorial();

  listaEl.innerHTML = "";
  listaElegidos = [];
  subtotalCombinacion = 0;
  actualizarSubtotalCombinacion();
  actualizarTotales();
}

function mostrarHistorial() {
  const tabla = document.getElementById("tabla-historial");
  tabla.innerHTML = "";
  let historial = JSON.parse(localStorage.getItem("historialProteinas") || "[]");
  historial.forEach((fila, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fila.fecha}</td>
      <td>${fila.alimentos}</td>
      <td>${fila.subtotal} g</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="eliminarDelHistorial(${index})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(tr);
  });
}

function eliminarDelHistorial(index) {
  let historial = JSON.parse(localStorage.getItem("historialProteinas") || "[]");
  const filaEliminada = historial[index];

  const fechaHoy = new Date().toLocaleDateString();
  if (filaEliminada.fecha.startsWith(fechaHoy)) {
    total -= filaEliminada.subtotal;
    if (total < 0) total = 0;
    guardarSubtotal();
    actualizarTotales();
  }
  historial.splice(index, 1);
  localStorage.setItem("historialProteinas", JSON.stringify(historial));
  mostrarHistorial();
}

function guardarConfiguraciones() {
  // Guardar el límite diario
  const limiteDiario = parseFloat(document.getElementById("limite-diario").value);
  if (!isNaN(limiteDiario) && limiteDiario >= 0) {
    localStorage.setItem("limiteDiario", limiteDiario);
  } else {
    alert("Por favor, ingresa un valor válido para el límite diario.");
    return;
  }

  // Guardar la lista de alimentos
  const lineas = document.getElementById("editor").value.split("\n");
  const nuevosAlimentos = {};
  for (let linea of lineas) {
    const partes = linea.split(":");
    if (partes.length === 2) {
      const nombre = partes[0].trim();
      const valor = parseFloat(partes[1]);
      if (!isNaN(valor)) {
        nuevosAlimentos[nombre] = valor;
      }
    }
  }
  alimentos = nuevosAlimentos; // Actualizar la lista de alimentos en memoria
  localStorage.setItem("alimentos", JSON.stringify(alimentos)); // Guardar en localStorage

  // Recargar la lista de alimentos en la calculadora
  cargarAlimentos();

  // Confirmación de guardado
  alert("Configuraciones guardadas correctamente.");
}

function cargarConfiguraciones() {
  const limiteDiario = parseFloat(localStorage.getItem("limiteDiario") || "45");
  document.getElementById("limite-diario").value = limiteDiario;
}

function guardarSubtotal() {
  const fechaHoy = new Date().toLocaleDateString();
  localStorage.setItem("subtotalProteinas", JSON.stringify({ fecha: fechaHoy, total }));
}

function cargarSubtotal() {
  const data = JSON.parse(localStorage.getItem("subtotalProteinas") || "{}");
  const fechaHoy = new Date().toLocaleDateString();
  if (data.fecha === fechaHoy) {
    total = data.total || 0;
  } else {
    total = 0;
  }
  actualizarTotales();
}

function exportarHistorial() {
  // Obtener el historial desde localStorage
  const historial = JSON.parse(localStorage.getItem("historialProteinas") || "[]");

  if (historial.length === 0) {
    alert("No hay datos en el historial para exportar.");
    return;
  }

  // Crear el contenido del archivo CSV
  let csvContent = "Fecha,Alimentos,Total (g)\n";
  historial.forEach(fila => {
    const fecha = fila.fecha.replace(/,/g, ""); // Eliminar comas de la fecha
    const alimentos = fila.alimentos.replace(/,/g, ";"); // Reemplazar comas en alimentos por punto y coma
    const total = fila.subtotal;
    csvContent += `${fecha},${alimentos},${total}\n`;
  });

  // Crear un blob con el contenido del CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Crear un enlace para descargar el archivo
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "historial_proteinas.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);

  // Hacer clic en el enlace para descargar el archivo
  link.click();

  // Eliminar el enlace después de la descarga
  document.body.removeChild(link);
}

function borrarTodoHistorial() {
  // Confirmación previa
  const confirmacion = confirm("¿Estás seguro de que deseas borrar todo el historial? Esta acción no se puede deshacer.");
  if (!confirmacion) {
    return; // Salir si el usuario cancela
  }

  // Eliminar el historial del localStorage
  localStorage.removeItem("historialProteinas");

  // Reiniciar el total del día si corresponde
  const fechaHoy = new Date().toLocaleDateString();
  const data = JSON.parse(localStorage.getItem("subtotalProteinas") || "{}");
  if (data.fecha === fechaHoy) {
    total = 0;
    guardarSubtotal();
    actualizarTotales();
  }

  // Actualizar la interfaz
  mostrarHistorial();
  alert("El historial ha sido borrado.");
}

// Inicializar la aplicación
cargarAlimentos();
cargarConfiguraciones();
cargarSubtotal();
mostrarHistorial();