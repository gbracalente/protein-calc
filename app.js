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
  "Ñoquis de papa (25 unidades - plato mediano)": 6,
  "Ñoquis de ricota (25 unidades - plato mediano)": 8,
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
  "Ravioles de verdura (16 unidades - plato mediano)": 7,
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
  alimentoSel.innerHTML = ''; // Limpiar el selector antes de llenarlo

  for (let key in alimentos) {
    const option = document.createElement('option');
    option.value = alimentos[key]; // El valor debe ser la cantidad de proteínas
    option.textContent = key; // El texto debe ser el nombre del alimento
    alimentoSel.appendChild(option);
  }
}

function agregarAlimento() {
  const alimentoSeleccionado = alimentoSel.options[alimentoSel.selectedIndex];
  const nombre = alimentoSeleccionado.textContent; // Nombre del alimento
  const proteinas = parseFloat(alimentoSeleccionado.value); // Cantidad de proteínas

  if (!isNaN(proteinas)) {
    // Agregar el alimento a la lista visual
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      ${nombre}
      <span class="badge bg-primary rounded-pill">${proteinas} g</span>
    `;

    // Botón para eliminar el alimento
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-danger btn-sm ms-2';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.onclick = () => eliminarAlimento(li, proteinas);

    li.appendChild(btnEliminar);
    listaEl.appendChild(li);

    // Actualizar lista de alimentos elegidos y subtotal
    listaElegidos.push({ nombre, proteinas });
    subtotalCombinacion += proteinas;
    actualizarSubtotalCombinacion();
    actualizarTotales();
  } else {
    console.error('El valor del alimento seleccionado es inválido.');
  }
}

// Llamar a cargarAlimentos al cargar la página
document.addEventListener('DOMContentLoaded', cargarAlimentos);

function eliminarAlimento(li, proteinas) {
  subtotalCombinacion -= proteinas;
  listaEl.removeChild(li);

  // Actualizar lista de alimentos elegidos
  listaElegidos = listaElegidos.filter((alimento) => alimento.proteinas !== proteinas);

  actualizarSubtotalCombinacion();
  actualizarTotales();
}

function actualizarTotales() {
  totalEl.textContent = total.toFixed(2); // Mostrar el total en la interfaz

  const limite = parseFloat(localStorage.getItem("limiteDiario") || "45"); // Límite diario
  if (total > limite) {
    estadoEl.textContent = `¡Excedido por ${(total - limite).toFixed(2)}g!`;
    estadoEl.style.color = "red";
  } else {
    estadoEl.textContent = `Dentro del límite (${(limite - total).toFixed(2)}g restantes)`;
    estadoEl.style.color = "green";
  }
  guardarSubtotal(); // Guardar el total actualizado
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

  // Sumar el subtotal al total del día
  total += subtotalCombinacion;

  // Actualizar la interfaz y los datos
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
  const limiteDiario = document.getElementById('limite-diario').value;
  let listaAlimentos = document.getElementById('editor').value;

  // Ordenar la lista de alimentos alfabéticamente considerando el idioma español
  listaAlimentos = listaAlimentos
    .split('\n')
    .filter(Boolean) // Filtrar líneas vacías
    .sort((a, b) => a.localeCompare(b, 'es')) // Ordenar alfabéticamente en español
    .join('\n');

  // Guardar en localStorage
  localStorage.setItem('limiteDiario', limiteDiario);
  localStorage.setItem('listaAlimentos', listaAlimentos);
  alert('Configuraciones guardadas correctamente.');
}

function cargarConfiguraciones() {
  const limiteDiario = localStorage.getItem('limiteDiario');
  let listaAlimentos = localStorage.getItem('listaAlimentos');

  if (limiteDiario) {
    document.getElementById('limite-diario').value = limiteDiario;
  }

  if (listaAlimentos) {
    listaAlimentos = listaAlimentos
      .split('\n')
      .filter(Boolean) // Filtrar líneas vacías
      .sort((a, b) => a.localeCompare(b, 'es')) // Ordenar alfabéticamente en español
      .join('\n');
    document.getElementById('editor').value = listaAlimentos;
  }
}

function guardarSubtotal() {
  const fechaHoy = new Date().toLocaleDateString(); // Fecha actual en formato local
  const datos = {
    total: total, // Guardar el total actual
    fecha: fechaHoy // Guardar la fecha actual
  };
  localStorage.setItem("datosProteinas", JSON.stringify(datos)); // Guardar en localStorage
}

function cargarSubtotal() {
  const fechaHoy = new Date().toLocaleDateString(); // Fecha actual en formato local
  const datos = JSON.parse(localStorage.getItem("datosProteinas") || "{}");

  if (datos.fecha === fechaHoy) {
    total = datos.total || 0; // Cargar el total guardado si es el mismo día
  } else {
    total = 0; // Reiniciar el total si es un nuevo día
  }
  actualizarTotales(); // Actualizar la interfaz con los valores cargados
}

function exportarHistorial() {
  const historial = JSON.parse(localStorage.getItem("historialProteinas") || "[]");

  if (historial.length === 0) {
    alert("No hay datos en el historial para exportar.");
    return;
  }

  let csvContent = "Fecha,Alimentos,Total (g)\n";
  historial.forEach(fila => {
    const fecha = fila.fecha.replace(/,/g, ""); // Eliminar comas de la fecha
    const alimentos = fila.alimentos.replace(/,/g, ";"); // Reemplazar comas en alimentos por punto y coma
    const total = fila.subtotal;
    csvContent += `${fecha},${alimentos},${total}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "historial_proteinas.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function borrarTodoHistorial() {
  const confirmacion = confirm("¿Estás seguro de que deseas borrar todo el historial? Esta acción no se puede deshacer.");
  if (!confirmacion) {
    return;
  }

  localStorage.removeItem("historialProteinas");

  const fechaHoy = new Date().toLocaleDateString();
  const data = JSON.parse(localStorage.getItem("subtotalProteinas") || "{}");
  if (data.fecha === fechaHoy) {
    total = 0;
  }

  mostrarHistorial();
  alert("El historial ha sido borrado.");
}

function cargarListaAlimentos() {
  const listaAlimentos = localStorage.getItem('listaAlimentos');
  const selectAlimento = document.getElementById('alimento');

  if (listaAlimentos) {
    const alimentos = listaAlimentos.split('\n').filter(Boolean); // Filtrar líneas vacías
    alimentos.sort((a, b) => a.localeCompare(b, 'es')); // Ordenar alfabéticamente en español
    selectAlimento.innerHTML = ''; // Limpiar el selector

    alimentos.forEach((alimento) => {
      const [nombre, valor] = alimento.split(':'); // Asume formato "nombre:valor"
      if (nombre && valor) {
        const option = document.createElement('option');
        option.value = valor.trim();
        option.textContent = nombre.trim();
        selectAlimento.appendChild(option);
      }
    });
  }
}

function exportarListaAlimentos() {
  const listaAlimentos = localStorage.getItem('listaAlimentos');

  if (!listaAlimentos) {
    alert("No hay alimentos guardados para exportar.");
    return;
  }

  const alimentosCSV = listaAlimentos
    .split('\n')
    .filter(Boolean) // Filtrar líneas vacías
    .map((linea) => {
      const [nombre, valor] = linea.split(':');
      return `${nombre.trim()},${valor.trim()}`;
    })
    .join('\n');

  const blob = new Blob([alimentosCSV], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "lista_alimentos.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function importarListaAlimentos(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const contenido = e.target.result;
    const lineas = contenido.split("\n");
    alimentos = {}; // Reiniciar la lista de alimentos

    lineas.forEach((linea) => {
      const [nombre, valor] = linea.split(",");
      if (nombre && valor) {
        alimentos[nombre.trim()] = parseFloat(valor.trim());
      }
    });

    cargarAlimentos();
    alert("Lista de alimentos importada correctamente.");
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarSubtotal(); // Cargar los totales al iniciar
  cargarAlimentos(); // Cargar la lista de alimentos
  cargarListaAlimentos(); // Cargar el selector de alimentos
  cargarConfiguraciones(); // Cargar configuraciones
  mostrarHistorial(); // Mostrar el historial
});