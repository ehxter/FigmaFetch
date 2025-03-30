async function fetchComponents() {
    const response = await fetch('/api/components');
    const data = await response.json();
    
    const list = document.getElementById('componentList');
    list.innerHTML = "";

    data.forEach(component => {
        const li = document.createElement("li");
        li.textContent = `${component.name} (ID: ${component.node_id})`;
        list.appendChild(li);
    });
}
