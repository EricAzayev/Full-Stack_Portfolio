import axios from 'axios';

(async () => {
    try {
        console.log("Triggering Community Board start via API to simulate UI click...");
        const startRes = await axios.post('http://localhost:3000/api/projects/community-board/start');
        console.log("Start Response:", startRes.data);

        console.log("Waiting 7 seconds for Vite to start and bind to port...");
        await new Promise(r => setTimeout(r, 7000));

        console.log("Pinging community-board on its custom mapped Open port 5180...");
        const res = await axios.get('http://localhost:5180');
        console.log("SUCCESS! Port 5180 responded with status code:", res.status);

        console.log("Triggering Stop...");
        await axios.post('http://localhost:3000/api/projects/community-board/stop');
        console.log("Done.");
    } catch (e) {
        console.error("Test failed:", e.message);
    }
})();
