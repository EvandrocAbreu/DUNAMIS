// Dados e constantes
let families = JSON.parse(localStorage.getItem('families')) || [];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Navegação
function showSection(section) {
    document.querySelectorAll('.main-section, .sidebar').forEach(el => el.style.display = 'none');
    document.getElementById(`${section}-section`).style.display = 'block';
    if (section === 'families') FamilyManager.loadFamilies();
    if (section === 'birthdays') BirthdayManager.loadBirthdays();
    if (section === 'stats') StatsManager.loadStats();
}

document.getElementById('nav-home').addEventListener('click', e => { e.preventDefault(); showSection('home'); });
document.getElementById('nav-families').addEventListener('click', e => { e.preventDefault(); showSection('families'); });
document.getElementById('nav-birthdays').addEventListener('click', e => { e.preventDefault(); showSection('birthdays'); });
document.getElementById('nav-stats').addEventListener('click', e => { e.preventDefault(); showSection('stats'); });

// Módulo de Gerenciamento de Famílias
const FamilyManager = {
    loadFamilies() {
        const list = document.getElementById('families-list');
        list.innerHTML = '';
        families.forEach((family, index) => {
            const card = document.createElement('div');
            card.className = 'family-card';
            card.innerHTML = `
                <div class="family-header" onclick="FamilyManager.toggleFamily(this)">
                    ${family.name}
                    <div>
                        <button class="btn" onclick="FamilyManager.editFamily(${index}); event.stopPropagation()">Editar</button>
                        <button class="btn" onclick="FamilyManager.deleteFamily(${index}); event.stopPropagation()">Excluir</button>
                    </div>
                </div>
                <div class="family-content">
                    ${family.members.map(member => `
                        <div class="member">
                            <img src="${member.photo || 'https://via.placeholder.com/150'}" alt="Foto">
                            <p><strong>Nome:</strong> ${member.name}</p>
                            <p><strong>Telefone:</strong> ${member.phone}</p>
                            <p><strong>Endereço:</strong> ${member.address}</p>
                            <p><strong>Data de Nascimento:</strong> ${member.birthdate || 'N/A'} (Idade: ${calculateAge(member.birthdate)})</p>
                            <p><strong>Frequência:</strong> ${member.frequency}</p>
                            <p><strong>Estado Civil:</strong> ${member.maritalStatus}</p>
                            <p><strong>Sexo:</strong> ${member.sex}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            list.appendChild(card);
        });
    },

    toggleFamily(header) {
        const content = header.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    },

    showForm() {
        document.getElementById('family-form').style.display = 'block';
    },

    hideForm() {
        document.getElementById('family-form').style.display = 'none';
        this.clearForm();
    },

    clearForm() {
        document.getElementById('family-name').value = '';
        document.getElementById('member-name').value = '';
        document.getElementById('member-phone').value = '';
        document.getElementById('member-address').value = '';
        document.getElementById('member-birthdate').value = '';
        document.getElementById('member-frequency').value = 'Regular';
        document.getElementById('member-marital-status').value = 'Solteiro';
        document.getElementById('member-sex').value = 'Masculino';
        document.getElementById('member-photo').value = '';
    },

    saveFamily() {
        const familyName = document.getElementById('family-name').value;
        const member = {
            name: document.getElementById('member-name').value,
            phone: document.getElementById('member-phone').value,
            address: document.getElementById('member-address').value,
            birthdate: new Date(document.getElementById('member-birthdate').value).toLocaleDateString('pt-BR'),
            frequency: document.getElementById('member-frequency').value,
            maritalStatus: document.getElementById('member-marital-status').value,
            sex: document.getElementById('member-sex').value,
            photo: ''
        };

        const photoInput = document.getElementById('member-photo');
        if (photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                member.photo = reader.result;
                this.addOrUpdateFamily(familyName, member);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            this.addOrUpdateFamily(familyName, member);
        }
    },

    addOrUpdateFamily(familyName, member) {
        const existingFamily = families.find(f => f.name === familyName);
        if (existingFamily) {
            existingFamily.members.push(member);
        } else {
            families.push({ name: familyName, members: [member] });
        }
        localStorage.setItem('families', JSON.stringify(families));
        this.loadFamilies();
        BirthdayManager.loadBirthdays();
        StatsManager.loadStats();
        this.hideForm();
    },

    editFamily(index) {
        const family = families[index];
        document.getElementById('family-name').value = family.name;
        this.showForm();
    },

    deleteFamily(index) {
        if (confirm('Tem certeza que deseja excluir esta família?')) {
            families.splice(index, 1);
            localStorage.setItem('families', JSON.stringify(families));
            this.loadFamilies();
            BirthdayManager.loadBirthdays();
            StatsManager.loadStats();
        }
    },

    searchFamilies() {
        const query = document.querySelector('.search-bar').value.toLowerCase();
        const filtered = families.filter(family => 
            family.name.toLowerCase().includes(query) || 
            family.members.some(m => m.name.toLowerCase().includes(query))
        );
        const list = document.getElementById('families-list');
        list.innerHTML = '';
        filtered.forEach((family, index) => {
            const card = document.createElement('div');
            card.className = 'family-card';
            card.innerHTML = `
                <div class="family-header" onclick="FamilyManager.toggleFamily(this)">
                    ${family.name}
                    <div>
                        <button class="btn" onclick="FamilyManager.editFamily(${index}); event.stopPropagation()">Editar</button>
                        <button class="btn" onclick="FamilyManager.deleteFamily(${index}); event.stopPropagation()">Excluir</button>
                    </div>
                </div>
                <div class="family-content">
                    ${family.members.map(member => `
                        <div class="member">
                            <img src="${member.photo || 'https://via.placeholder.com/150'}" alt="Foto">
                            <p><strong>Nome:</strong> ${member.name}</p>
                            <p><strong>Telefone:</strong> ${member.phone}</p>
                            <p><strong>Endereço:</strong> ${member.address}</p>
                            <p><strong>Data de Nascimento:</strong> ${member.birthdate || 'N/A'} (Idade: ${calculateAge(member.birthdate)})</p>
                            <p><strong>Frequência:</strong> ${member.frequency}</p>
                            <p><strong>Estado Civil:</strong> ${member.maritalStatus}</p>
                            <p><strong>Sexo:</strong> ${member.sex}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            list.appendChild(card);
        });
    },

    handleExcelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', dateNF: 'dd/mm/yyyy' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            FamilyManager.processExcelData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    },

    processExcelData(data) {
        const newFamilies = {};
        data.forEach(row => {
            const familyName = row['Nome da Família'] || 'Família Sem Nome';
            let birthdate = row['Data de Nascimento'];

            if (typeof birthdate === 'number') {
                const date = XLSX.SSF.parse_date_code(birthdate);
                birthdate = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
            } else if (birthdate && typeof birthdate === 'string') {
                const parts = birthdate.split('/');
                if (parts.length === 3) {
                    birthdate = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
                } else {
                    birthdate = '';
                }
            } else {
                birthdate = '';
            }

            const member = {
                name: row['Nome do Membro'] || '',
                phone: row['Telefone'] || '',
                address: row['Endereço'] || '',
                birthdate: birthdate,
                frequency: row['Frequência'] || 'Regular',
                maritalStatus: row['Estado Civil'] || 'Não informado',
                sex: row['Sexo'] || 'Não informado',
                photo: row['Foto'] || ''
            };

            if (!newFamilies[familyName]) {
                newFamilies[familyName] = { name: familyName, members: [] };
            }
            newFamilies[familyName].members.push(member);
        });

        families = Object.values(newFamilies);
        localStorage.setItem('families', JSON.stringify(families));
        this.loadFamilies();
        BirthdayManager.loadBirthdays();
        StatsManager.loadStats();
    }
};

// Módulo de Aniversariantes
const BirthdayManager = {
    loadBirthdays() {
        const filter = document.getElementById('month-filter');
        const list = document.getElementById('birthdays-list');
        filter.innerHTML = '';
        list.innerHTML = '';

        months.forEach((month, index) => {
            const btn = document.createElement('button');
            btn.className = 'month-btn';
            btn.textContent = month.slice(0, 3);
            btn.onclick = () => this.filterBirthdays(index + 1);
            filter.appendChild(btn);
        });

        const currentMonth = new Date().getMonth();
        document.querySelectorAll('.month-btn')[currentMonth].classList.add('active');
        this.filterBirthdays(currentMonth + 1);
    },

    filterBirthdays(month) {
        const list = document.getElementById('birthdays-list');
        list.innerHTML = '';

        const birthdays = families.flatMap(f => f.members)
            .filter(m => {
                if (!m.birthdate) return false;
                const [_, mMonth] = m.birthdate.split('/');
                return parseInt(mMonth) === month;
            });

        if (birthdays.length > 0) {
            list.innerHTML = `<h3>${months[month - 1]}</h3>`;
            birthdays.forEach(member => {
                list.innerHTML += `<p>${member.name} - ${member.birthdate}</p>`;
            });
        } else {
            list.innerHTML = `<p>Nenhum aniversariante em ${months[month - 1]}</p>`;
        }

        document.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.month-btn:nth-child(${month})`).classList.add('active');
    }
};

// Módulo de Estatísticas
const StatsManager = {
    loadStats() {
        const content = document.getElementById('stats-content');
        const allMembers = families.flatMap(f => f.members);

        const totalMembers = allMembers.length;
        const minors = allMembers.filter(m => calculateAge(m.birthdate) < 18 && calculateAge(m.birthdate) !== 'N/A').length;
        const seniors = allMembers.filter(m => calculateAge(m.birthdate) > 60 && calculateAge(m.birthdate) !== 'N/A').length;

        const maritalStatusCount = {};
        const sexCount = {};
        allMembers.forEach(m => {
            maritalStatusCount[m.maritalStatus] = (maritalStatusCount[m.maritalStatus] || 0) + 1;
            sexCount[m.sex] = (sexCount[m.sex] || 0) + 1;
        });

        content.innerHTML = `
            <ul>
                <li><strong>Total de Membros:</strong> ${totalMembers}</li>
                <li><strong>Menores de 18 anos:</strong> ${minors}</li>
                <li><strong>Mais de 60 anos:</strong> ${seniors}</li>
                <li><strong>Estado Civil:</strong>
                    <ul>${Object.entries(maritalStatusCount).map(([status, count]) => `<li>${status}: ${count}</li>`).join('')}</ul>
                </li>
                <li><strong>Sexo:</strong>
                    <ul>${Object.entries(sexCount).map(([sex, count]) => `<li>${sex}: ${count}</li>`).join('')}</ul>
                </li>
            </ul>
        `;
    }
};

// Utilitários
function calculateAge(birthdate) {
    if (!birthdate) return 'N/A';
    const [day, month, year] = birthdate.split('/').map(Number);
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Inicialização e Eventos
document.querySelector('.btn-add').addEventListener('click', () => FamilyManager.showForm());
document.getElementById('save-family-btn').addEventListener('click', () => FamilyManager.saveFamily());
document.getElementById('cancel-family-btn').addEventListener('click', () => FamilyManager.hideForm());
document.getElementById('excel-upload').addEventListener('change', FamilyManager.handleExcelUpload);
document.querySelector('.search-bar').addEventListener('keyup', () => FamilyManager.searchFamilies());

showSection('home');