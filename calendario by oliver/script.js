// Variables de control
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("events")) || {};
let selectedDay = null;

// Mes y año mostrados actualmente
let displayedMonth = currentDate.getMonth();
let displayedYear = currentDate.getFullYear();

// DOM
const calendar = document.getElementById("calendar");
const selectMonth = document.getElementById("selectMonth");
const selectYear = document.getElementById("selectYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const modal = document.getElementById("modal");
const modalDate = document.getElementById("modal-date");
const closeModal = document.querySelector(".close");
const saveEventBtn = document.getElementById("saveEvent");
const deleteEventBtn = document.getElementById("deleteEvent");
const eventTitle = document.getElementById("eventTitle");
const eventTime = document.getElementById("eventTime");
const openAddEventModal = document.getElementById("openAddEventModal");
const modalDatePicker = document.getElementById("modalDatePicker");

// Inicializar mes y año
function initMonthYear() {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    months.forEach((m, i) => {
        const o = document.createElement("option");
        o.value = i;
        o.textContent = m;
        if (i === displayedMonth) o.selected = true;
        selectMonth.appendChild(o);
    });
    const yearNow = currentDate.getFullYear();
    for (let y = yearNow - 5; y <= yearNow + 5; y++) {
        const o = document.createElement("option");
        o.value = y;
        o.textContent = y;
        if (y === displayedYear) o.selected = true;
        selectYear.appendChild(o);
    }
}
initMonthYear();

// Generar key consistente YYYY-MM-DD
function getDayKey(year, month, day) {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

// Render calendario
function renderCalendar(month = displayedMonth, year = displayedYear) {
    calendar.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        const dayKey = getDayKey(year, month + 1, i);
        const weekDay = new Date(year, month, i).getDay();

        if (events[dayKey]) dayDiv.classList.add("event");
        if (weekDay === 0 || weekDay === 6) dayDiv.classList.add("weekend");
        if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth()) || (year === today.getFullYear() && month === today.getMonth() && i < today.getDate())) dayDiv.classList.add("past");
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) dayDiv.classList.add("today");

        if (events[dayKey]) {
            const span = document.createElement("span");
            span.textContent = events[dayKey].title;
            span.classList.add("event-title");
            dayDiv.appendChild(document.createElement("br"));
            dayDiv.appendChild(span);
        }

        dayDiv.addEventListener("click", () => {
            selectedDay = i;
            openModal(dayKey);
        });

        calendar.appendChild(dayDiv);
    }
}

// Cambiar mes/año
function changeMonthYear(month, year) {
    displayedMonth = month;
    displayedYear = year;
    selectMonth.value = month;
    selectYear.value = year;
    renderCalendar(month, year);
}

// Botones navegación
prevMonth.addEventListener("click", () => {
    let month = displayedMonth - 1;
    let year = displayedYear;
    if (month < 0) {
        month = 11;
        year--;
    }
    changeMonthYear(month, year);
});
nextMonth.addEventListener("click", () => {
    let month = displayedMonth + 1;
    let year = displayedYear;
    if (month > 11) {
        month = 0;
        year++;
    }
    changeMonthYear(month, year);
});
selectMonth.addEventListener("change", () => changeMonthYear(parseInt(selectMonth.value), displayedYear));
selectYear.addEventListener("change", () => changeMonthYear(displayedMonth, parseInt(selectYear.value)));

// Abrir modal
function openModal(dayKey = null) {
    modal.style.display = "flex";
    eventTitle.value = "";
    eventTime.value = "";

    if (dayKey) {
        const parts = dayKey.split("-");
        selectedDay = parseInt(parts[2]);
        displayedMonth = parseInt(parts[1]) - 1;
        displayedYear = parseInt(parts[0]);
        selectMonth.value = displayedMonth;
        selectYear.value = displayedYear;
        modalDate.textContent = `${selectedDay}-${displayedMonth+1}-${displayedYear}`;
        modalDatePicker.value = `${displayedYear}-${String(displayedMonth+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;

        // Asignación segura para evitar errores
        eventTitle.value = (events[dayKey] && events[dayKey].title) ? events[dayKey].title : "";
        eventTime.value = (events[dayKey] && events[dayKey].time) ? events[dayKey].time : "";

    } else {
        const today = currentDate;
        selectedDay = today.getDate();
        displayedMonth = today.getMonth();
        displayedYear = today.getFullYear();
        selectMonth.value = displayedMonth;
        selectYear.value = displayedYear;
        modalDate.textContent = `${selectedDay}-${displayedMonth+1}-${displayedYear}`;
        modalDatePicker.value = `${displayedYear}-${String(displayedMonth+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;
    }
}

// Cambiar fecha desde mini calendario
modalDatePicker.addEventListener("change", () => {
    const d = new Date(modalDatePicker.value);
    selectedDay = d.getDate();
    displayedMonth = d.getMonth();
    displayedYear = d.getFullYear();
    modalDate.textContent = `${selectedDay}-${displayedMonth+1}-${displayedYear}`;
});

// Guardar evento
saveEventBtn.addEventListener("click", () => {
    if (!selectedDay) return alert("Selecciona un día");
    const dayKey = getDayKey(displayedYear, displayedMonth + 1, selectedDay);
    if (eventTitle.value.trim() === "") return alert("Escribe un nombre para el evento");
    events[dayKey] = { title: eventTitle.value.trim(), time: eventTime.value };
    localStorage.setItem("events", JSON.stringify(events));
    renderCalendar(displayedMonth, displayedYear);
    modal.style.display = "none";
});

// Eliminar evento
deleteEventBtn.addEventListener("click", () => {
    if (!selectedDay) return alert("Selecciona un día");
    const dayKey = getDayKey(displayedYear, displayedMonth + 1, selectedDay);
    if (events[dayKey]) delete events[dayKey];
    localStorage.setItem("events", JSON.stringify(events));
    renderCalendar(displayedMonth, displayedYear);
    modal.style.display = "none";
});

// Cerrar modal
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

// Abrir modal desde botón
openAddEventModal.addEventListener("click", () => openModal());

// Render inicial
renderCalendar();

// --- Configuración OAuth Google ---
const CLIENT_ID = '779389421958-ki52otefog0ltpbsdin8fes1f0u5s580.apps.googleusercontent.com'; // Reemplaza con tu ID real
const API_KEY = 'AIzaSyDGe0JEncD71ct3ZPOom8vH3LQa2MF4Fxc'; // Reemplaza con tu API Key
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Inicializar Google API
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        console.log("Google API inicializado");
    }, (error) => {
        console.error("Error inicializando Google API", error);
    });
}

// --- Autenticación ---
function authenticate() {
    return gapi.auth2.getAuthInstance().signIn();
}

// --- Crear evento en Google Calendar ---
function createGoogleEvent(event) {
    const gEvent = {
        'summary': event.title,
        'start': {
            'dateTime': event.date + 'T' + (event.time || '09:00') + ':00',
            'timeZone': 'America/New_York' // Ajusta según tu zona
        },
        'end': {
            'dateTime': event.date + 'T' + (event.time || '10:00') + ':00',
            'timeZone': 'America/New_York'
        }
    };

    gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': gEvent
    }).then(response => {
        console.log('Evento sincronizado: ', response);
    }, error => {
        console.error("Error sincronizando evento", error);
    });
}

// --- Botón sincronizar ---
const syncGoogle = document.getElementById("syncGoogle");
syncGoogle.addEventListener("click", async() => {
    try {
        await authenticate();

        // Enviar todos los eventos locales a Google Calendar
        for (let key in events) {
            createGoogleEvent({
                date: key, // YYYY-MM-DD
                title: events[key].title,
                time: events[key].time
            });
        }

        alert("Todos los eventos se han sincronizado con Google Calendar");

    } catch (e) {
        console.error("Error autenticando Google", e);
        alert("No se pudo sincronizar con Google Calendar");
    }
});

// Inicializar Google API
handleClientLoad();