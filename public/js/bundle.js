/* eslint-disable no-undef */ const $57343aa7f3ab0fd6$export$4c5dd147b21b9176 = (locations)=>{
    const map = L.map('map').setView([
        34.124693,
        -118.113807
    ], 13); // Default center
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const markers = [];
    locations.forEach((loc)=>{
        const { coordinates: coordinates, day: day, description: description } = loc; // Extract coordinates & description
        if (coordinates.length === 2) {
            const marker = L.marker([
                coordinates[1],
                coordinates[0]
            ]).addTo(map);
            // Add popup with day and description
            marker.bindPopup(`<b style="font-size: 18px;">Day ${day} ${description}</b>`).openPopup();
            markers.push(marker);
        }
    });
    // If multiple locations exist, adjust the map to fit all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds(), {
            padding: [
                50,
                50
            ]
        }); // Adjust zoom to fit all markers
    }
};


/* eslint-disable no-undef */ const $3adf927435cf4518$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const $3adf927435cf4518$export$de026b00723010c1 = (type, msg, time = 7)=>{
    $3adf927435cf4518$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout($3adf927435cf4518$export$516836c6a9dfc573, time * 1000);
};


const $70af9284e599e604$export$596d806903d1f59e = async (email, password)=>{
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === 'success') {
            (0, $3adf927435cf4518$export$de026b00723010c1)('success', 'Logged in successfully!');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        console.log('err=', err);
        const message = err?.response?.data?.message || 'Error while login! Try again.';
        (0, $3adf927435cf4518$export$de026b00723010c1)('error', message);
    }
};


/* eslint-disable no-undef */ 
const $ef37cb3ad0fa2fc3$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        if (res.data.status === 'success') location.reload(true);
    } catch (error) {
        console.log('Error while logout', error);
        (0, $3adf927435cf4518$export$de026b00723010c1)('error', 'Error logging out! Try again.');
    }
};


/* eslint-disable no-undef */ 
const $936fcc27ffb6bbb1$export$f558026a994b6051 = async (data, type)=>{
    try {
        const url = type === 'password' ? '/api/v1/users/update-my-password' : '/api/v1/users/update-me';
        const res = await axios({
            method: 'PATCH',
            url: url,
            data: data
        });
        if (res.data.status === 'success') (0, $3adf927435cf4518$export$de026b00723010c1)('success', `${type.toUpperCase()} updated successfully!`);
    } catch (error) {
        (0, $3adf927435cf4518$export$de026b00723010c1)('error', error.response.data.message);
    }
};


// Dom element
const $d0f7ce18c37ad6f6$var$mapBox = document.getElementById('map');
const $d0f7ce18c37ad6f6$var$loginForm = document.querySelector('.form--login');
const $d0f7ce18c37ad6f6$var$logoutBtn = document.querySelector('.nav__el--logout');
const $d0f7ce18c37ad6f6$var$userDataForm = document.querySelector('.form-user-data');
const $d0f7ce18c37ad6f6$var$userPasswordForm = document.querySelector('.form-user-password');
// const bookBtn = document.getElementById('book-tour');
// Delegation
if ($d0f7ce18c37ad6f6$var$mapBox) {
    const locations = JSON.parse($d0f7ce18c37ad6f6$var$mapBox.dataset.locations);
    (0, $57343aa7f3ab0fd6$export$4c5dd147b21b9176)(locations);
}
if ($d0f7ce18c37ad6f6$var$loginForm) $d0f7ce18c37ad6f6$var$loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    (0, $70af9284e599e604$export$596d806903d1f59e)(email, password);
});
if ($d0f7ce18c37ad6f6$var$logoutBtn) $d0f7ce18c37ad6f6$var$logoutBtn.addEventListener('click', (0, $ef37cb3ad0fa2fc3$export$a0973bcfe11b05c9));
if ($d0f7ce18c37ad6f6$var$userDataForm) $d0f7ce18c37ad6f6$var$userDataForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    // const form = new FormData();
    // form.append('name', document.getElementById('name').value);
    // form.append('email', document.getElementById('email').value);
    // form.append('photo', document.getElementById('photo').files[0]);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await (0, $936fcc27ffb6bbb1$export$f558026a994b6051)({
        name: name,
        email: email
    }, 'data');
});
if ($d0f7ce18c37ad6f6$var$userPasswordForm) $d0f7ce18c37ad6f6$var$userPasswordForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await (0, $936fcc27ffb6bbb1$export$f558026a994b6051)({
        passwordCurrent: passwordCurrent,
        password: password,
        passwordConfirm: passwordConfirm
    }, 'password');
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
});


//# sourceMappingURL=bundle.js.map
