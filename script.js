import { elastic } from "./config.json";

function displayResults(results) {
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';

    if (results.length > 0) {
        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td>${result.name}</td>
          <td>${result.specialty}</td>
          <td>${result.location}</td>
          <td>${result.availability}</td>
          <td>${result.rating}</td>
        `;
            resultsBody.appendChild(row);
        });

        const resultsDiv = document.getElementById('results');
        resultsDiv.style.display = 'block';
    } else {
        const resultsDiv = document.getElementById('results');
        resultsDiv.style.display = 'none';
    }
}

function buildSearchQuery(specialty, location, day) {
    const keyToLookFor = [];

    if (specialty != "") {
        keyToLookFor.push({ "match": { "specialty": specialty } });
    }

    if (location != "") {
        keyToLookFor.push({ "match": { "location": location } });
    }

    if (day != "") {
        keyToLookFor.push({ "exists": { "field": `availability.${day}` } });
    }

    keyToLookFor.push({ "term": { "active": true } });

    const query = {
        "query": {
            "bool": {
                "must": keyToLookFor
            }
        },
        "sort": [
            { "rating": { "order": "desc" } }
        ]
    };

    return query;
}

function makeServerCallToSearch(searchQuery) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost:9200/doctors/_search', true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${elastic.username}:${elastic.password}`));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const hits = response.hits.hits;

                const results = hits.map(hit => hit._source);

                displayResults(results);
            } else {
                console.error('Failed to fetch search results.');
            }
        }
    };

    xhr.send(JSON.stringify(searchQuery));
}

function handleSearch() {
    const specialty = document.getElementById('specialty').value;
    const location = document.getElementById('location').value;
    const day = document.getElementById('day').value;

    const searchQuery = buildSearchQuery(specialty, location, day);

    makeServerCallToSearch(searchQuery);
}

document.getElementById('search-btn').addEventListener('click', handleSearch);