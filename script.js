let projects = [];
let editId = null;

const save = () =>
    localStorage.setItem("projects", JSON.stringify(projects));

const today = () => {
    const d = new Date();

    const day = String(d.getDate()).padStart(2, "0");

    const month = d.toLocaleString("en-US", {
        month: "short"
    });

    return `${day}-${month}`;
};

async function load() {

    const saved = localStorage.getItem("projects");

    projects = saved
        ? JSON.parse(saved)
        : await fetch("projects.json").then(r => r.json());

    save();
    render();
}

function render() {

    const filters = [...document.querySelectorAll(".filter-input")];

    const data = projects.filter(p =>
        filters.every(f =>
            !f.value ||
            String(p[f.dataset.filter] || "")
                .toLowerCase()
                .includes(f.value.toLowerCase())
        )
    );

    document.querySelectorAll(".cards-container")
        .forEach(c => c.innerHTML = "");

    data.forEach(p => {

        const card = document.createElement("div");

        card.className =
            "project-card " +
            (p.status === "Planning"
                ? "planning-card"
                : p.status === "In - Progress"
                    ? "progress-card"
                    : "completed-card");

        card.draggable = true;
        card.dataset.id = p.id;

        card.innerHTML = `
            <div class="project-name">${p.name}</div>

            <div class="project-owner">
                Owner: ${p.owner}
            </div>

            <div class="project-stage">
                Resource: ${p.resource}
            </div>

            <div class="card-date">
                ${p.startDate || ""}
            </div>

            <div class="card-closure">
                ${p.endDate || ""}
            </div>

            <a class="edit-link" data-id="${p.id}">
                Edit
            </a>
        `;

        document
            .querySelector(
                `.cards-container[data-status="${p.status}"]`
            )
            .appendChild(card);
    });

    document.querySelector("#projectTableBody").innerHTML =
        data.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.owner}</td>
                <td>${p.status}</td>
                <td>${p.startDate || ""}</td>
                <td>${p.endDate || ""}</td>
                <td>${p.resource}</td>
                <td>${p.comments || ""}</td>
            </tr>
        `).join("");
}

//add project

document.querySelector("#addBtn").onclick = () => {

    editId = null;

    document.querySelector("#modalTitle").textContent =
        "Add New Project";

    document.querySelector("#projectName").value = "";
    document.querySelector("#projectOwner").value = "";
    document.querySelector("#projectStatus").value = "Planning";
    document.querySelector("#projectResource").value = "";
    document.querySelector("#projectComments").value = "";

    document.querySelector("#modalOverlay").style.display =
        "flex";
};

//save project

document.querySelector("#saveBtn").onclick = () => {

    const data = {

        name: document.querySelector("#projectName").value,

        owner: document.querySelector("#projectOwner").value,

        status: document.querySelector("#projectStatus").value,

        resource: document.querySelector("#projectResource").value,

        comments: document.querySelector("#projectComments").value

    };


    if (editId) {

        const project =
            projects.find(p => p.id == editId);

        Object.assign(project, data);

    } else {

        projects.push({

            id: Date.now(),

            ...data,

            startDate: "",
            endDate: ""

        });

    }

    save();

    render();

    closeModal();
};

//edit

document.querySelector(".board").onclick = e => {

    if (!e.target.classList.contains("edit-link"))
        return;

    editId = e.target.dataset.id;

    const p =
        projects.find(x => x.id == editId);

    document.querySelector("#modalTitle").textContent =
        "Edit Project";

    document.querySelector("#projectName").value =
        p.name;

    document.querySelector("#projectOwner").value =
        p.owner;

    document.querySelector("#projectStatus").value =
        p.status;

    document.querySelector("#projectResource").value =
        p.resource;

    document.querySelector("#projectComments").value =
        p.comments || "";

    document.querySelector("#modalOverlay").style.display =
        "flex";
};

//edit after double click

document.querySelector(".board").ondblclick = e => {

    const card =
        e.target.closest(".project-card");

    if (card)
        card.querySelector(".edit-link").click();
};

//drag

document.querySelector(".board").ondragstart = e => {

    const card =
        e.target.closest(".project-card");

    if (card)
        e.dataTransfer.setData(
            "id",
            card.dataset.id
        );
};

//drag and drop

document.querySelector(".board").ondragover =
    e => e.preventDefault();

document.querySelector(".board").ondrop = e => {

    e.preventDefault();

    const container =
        e.target.closest(".cards-container");

    if (!container)
        return;

    const project =
        projects.find(
            p =>
                p.id ==
                e.dataTransfer.getData("id")
        );

    project.status =
        container.dataset.status;


    if (
        project.status === "In - Progress" &&
        !project.startDate
    ) {
        project.startDate = today();
    }


    if (project.status === "Completed") {

        if (!project.startDate)
            project.startDate = today();

        project.endDate = today();
    }


    if (project.status === "Planning") {

        project.startDate = "";
        project.endDate = "";

    }


    save();

    render();
};

document.querySelectorAll(".filter-input")
    .forEach(input =>
        input.oninput = render
    );

document.querySelector("#refreshBtn").onclick = () => {
    render();
    alert("Data refreshed successfully!");
};

document.querySelector("#cancelBtn").onclick =
    closeModal;


function closeModal() {

    document.querySelector("#modalOverlay")
        .style.display = "none";

    editId = null;
}

load();