// 表形式で入力用のテーブルを生成する関数
function generateInputTable() {
    const seniors = document.getElementById('seniors').value.split('\n').map(s => s.trim()).filter(s => s !== '');
    const juniors = document.getElementById('juniors').value.split('\n').map(j => j.trim()).filter(j => j !== '');

    let tableHTML = '<table><tr><th>上級生</th><th>役職</th><th>被指導者</th></tr>';
    seniors.forEach(senior => {
        tableHTML += `<tr>
                        <td>${senior}</td>
                        <td><input type="text" class="role" data-member="${senior}"></td>
                        <td class="junior-dropzone" data-senior="${senior}"></td>
                      </tr>`;
    });
    tableHTML += '</table>';

    tableHTML += '<div class="junior-container">';
    juniors.forEach(junior => {
        tableHTML += `<div class="junior-draggable" draggable="true" data-junior="${junior}">${junior}</div>`;
    });
    tableHTML += '</div>';

    document.getElementById('input-table').innerHTML = tableHTML;

    // ドラッグ＆ドロップイベントリスナーの追加
    addDragAndDropListeners();
}

//ドラッグアンドドロップのイベントリスナー
function addDragAndDropListeners() {
    const draggables = document.querySelectorAll('.junior-draggable');
    const dropzones = document.querySelectorAll('.junior-dropzone');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-junior'));
        });

        draggable.addEventListener('dragend', () => {
            dropzones.forEach(dropzone => {
                dropzone.classList.remove('over');
            });
        });
    });

    dropzones.forEach(dropzone => {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('over');
            const junior = e.dataTransfer.getData('text/plain');
            const juniorElement = document.querySelector(`.junior-draggable[data-junior="${junior}"]`);
            if (juniorElement) {
                dropzone.appendChild(juniorElement);
            }
        });
    });
}


// 表形式で結果を出力する関数
function displayResult(optimalOrder, score, roles) {
    let resultDiv = document.getElementById('result');
    let tableHTML = '<table><tr><th>部員</th><th>スキル</th><th>ペア</th></tr>';

    optimalOrder.forEach(member => {
        if (roles[member]) {
            let rolesList = roles[member].roles ? roles[member].roles.join(', ') : '';
            let category = roles[member].category;
            let mentors = roles[member].mentors ? roles[member].mentors.join(', ') : '';
            let mentees = roles[member].mentees ? roles[member].mentees.join(', ') : '';
            tableHTML += `<tr>
                            <td>${member}<br><p class="cat">${category}</p></td>
                            <td>${rolesList}</td>
                            <td>${category === '上級生' ? mentees : mentors}</td>
                          </tr>`;
        }
    });

    tableHTML += '</table>';
    tableHTML += `<div>Score: ${score}</div>`;
    resultDiv.innerHTML = tableHTML;
}

// 最適な順番を生成する関数
function runGeneticAlgorithm() {
    const seniors = document.getElementById('seniors').value.split('\n').map(s => s.trim()).filter(s => s !== '');
    const juniors = document.getElementById('juniors').value.split('\n').map(j => j.trim()).filter(j => j !== '');
    const allMembers = [...seniors, ...juniors];

    let roles = {};

    allMembers.forEach(member => {
        const roleInput = document.querySelector(`.role[data-member="${member}"]`);
        if (roleInput) {
            roles[member] = {
                roles: roleInput.value.split(',').map(r => r.trim()).filter(r => r !== ''),
                category: seniors.includes(member) ? '上級生' : '下級生',
                mentors: [],
                mentees: []
            };
        } else {
            roles[member] = {
                roles: [],
                category: seniors.includes(member) ? '上級生' : '下級生',
                mentors: [],
                mentees: []
            };
        }
    });

    document.querySelectorAll('.junior-dropzone').forEach(dropzone => {
        const senior = dropzone.getAttribute('data-senior');
        dropzone.querySelectorAll('.junior-draggable').forEach(junior => {
            const juniorName = junior.getAttribute('data-junior');
            roles[senior].mentees.push(juniorName);
            roles[juniorName].mentors.push(senior);
        });
    });

    const finalResult = geneticAlgorithm(allMembers, roles);
    displayResult(finalResult[0], finalResult[1], roles);
}
