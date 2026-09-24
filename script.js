const services = {
    'signature-cut': { name: 'The Signature Cut', price: 38, duration: 45 },
    'skin-fade': { name: 'Skin Fade', price: 42, duration: 60 },
    'beard-reset': { name: 'Beard Reset', price: 26, duration: 30 },
    'cut-beard': { name: 'Cut & Beard', price: 58, duration: 75 },
    'buzz-cut': { name: 'Buzz Cut', price: 25, duration: 30 },
    'junior-cut': { name: 'Junior Cut', price: 24, duration: 30 },
    'head-shave': { name: 'Head Shave', price: 30, duration: 30 }
};
const barbers = { alex: 'Alex Morgan', maya: 'Maya Patel', sam: 'Sam Okafor' };

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu-toggle'),
        nav = document.querySelector('.main-nav');
    if (menu) menu.addEventListener('click', () => { const open = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', open) });
    const modal = document.querySelector('.promo-modal');
        if (modal && !sessionStorage.getItem('pme-promo-seen')) { setTimeout(() => { modal.hidden = false;
            sessionStorage.setItem('pme-promo-seen', '1') }, 1200) }
    document.querySelectorAll('.modal-close,.modal-backdrop').forEach(el => el.addEventListener('click', () => { if (modal) modal.hidden = true }));
    setupBooking();
});

function setupBooking() {
    const form = document.querySelector('#booking-form');
    if (!form) return;
    const serviceSelect = form.querySelector('#service'),
        barberSelect = form.querySelector('#barber'),
        dateInput = form.querySelector('#date'),
        timeSelect = form.querySelector('#time');
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateInput.min = today.toISOString().split('T')[0];
    const params = new URLSearchParams(location.search);
    if (params.get('service') && services[params.get('service')]) serviceSelect.value = params.get('service');

    function updateSummary() { const s = services[serviceSelect.value];
        document.querySelector('#summary-service').textContent = s ? s.name : 'Choose a service';
        document.querySelector('#summary-price').textContent = s ? '$' + s.price : '—';
        document.querySelector('#summary-barber').textContent = barbers[barberSelect.value] || 'Any barber';
        document.querySelector('#summary-date').textContent = dateInput.value ? formatDate(dateInput.value) : 'Select a date';
        document.querySelector('#summary-time').textContent = timeSelect.value || 'Select a time'; }
    [serviceSelect, barberSelect, dateInput, timeSelect].forEach(el => el.addEventListener('change', updateSummary));
    form.addEventListener('submit', e => { e.preventDefault(); if (!form.checkValidity()) { form.classList.add('validated');
            form.querySelector(':invalid').focus(); return } const data = { service: services[serviceSelect.value], barber: barbers[barberSelect.value], date: dateInput.value, time: timeSelect.value, name: form.querySelector('#name').value, email: form.querySelector('#email').value, phone: form.querySelector('#phone').value };
        document.querySelector('#booking-form-wrap').hidden = true; const confirmation = document.querySelector('#confirmation');
        confirmation.hidden = false;
        document.querySelector('#confirm-name').textContent = data.name.split(' ')[0];
        document.querySelector('#confirm-detail').textContent = `${data.service.name} with ${data.barber} · ${formatDate(data.date)} at ${data.time}`;
        document.querySelector('#google-calendar').href = googleUrl(data);
        document.querySelector('#download-ics').href = icsUrl(data);
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    updateSummary();
}

function formatDate(value) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }

function calendarDate(date, time) { const [h, m] = time.split(':'); const d = new Date(`${date}T${time}:00`); const end = new Date(d.getTime() + (services[document.querySelector('#service').value].duration * 60000)); return { start: d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), end: end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') } }

function googleUrl(data) { const t = calendarDate(data.date, data.time); return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(`PMe · ${data.service.name}`) + '&dates=' + t.start + '/' + t.end + '&details=' + encodeURIComponent(`Appointment with ${data.barber}. Booked for ${data.name}. See you at PMe Barber Studio.`) + '&location=' + encodeURIComponent('Borrowdale, Harare, Zimbabwe') }

function icsUrl(data) { const t = calendarDate(data.date, data.time); const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PMe//Booking//EN', 'BEGIN:VEVENT', `UID:pme-${Date.now()}@pridemuleya.co.zw`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`, `DTSTART:${t.start}`, `DTEND:${t.end}`, `SUMMARY:PMe · ${data.service.name}`, `DESCRIPTION:Appointment with ${data.barber}. Booked for ${data.name}.`, `LOCATION:Borrowdale\\, Harare\\, Zimbabwe`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'); return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics) }