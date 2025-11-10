
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const processList = document.getElementById('process-list');
    const addProcessBtn = document.getElementById('add-process-btn');
    
    // Algorithm selection elements
    const algorithmGrid = document.getElementById('algorithm-grid');
    const algoDetailsBox = document.getElementById('algo-details-box');
    const tqInputContainer = document.getElementById('tq-input-container');
    const timeQuantumInput = document.getElementById('time-quantum');
    
    const runBtn = document.getElementById('run-btn');
    const runSpinner = document.getElementById('run-spinner');
    const errorMessage = document.getElementById('error-message');
    
    // Results elements
    const resultsContainer = document.getElementById('results-container');
    const resultsTitle = document.getElementById('results-title');
    const resultsTableContainer = document.getElementById('results-table-container');
    const resultsAverages = document.getElementById('results-averages');
    const ganttChartContainer = document.getElementById('gantt-chart-container');
    const ganttLegendContainer = document.getElementById('gantt-legend');
    
    // Hero buttons
    const heroTryBtn = document.getElementById('hero-try-btn');
    const heroLearnBtn = document.getElementById('hero-learn-btn');

    //  App State 
    let processIdCounter = 1;
    let selectedAlgorithm = 'fcfs'; // Default algorithm
    
    //  Algorithm Data Store 
    const ALGO_DETAILS = {
        'fcfs': { 
            name: 'First Come First Serve (FCFS)', 
            short: 'Non-preemptive. Processes run in arrival order.',
            desc: 'Processes are executed in the exact order they arrive in the ready queue. This is simple and fair, but a long process can block shorter ones, leading to high average wait times (Convoy Effect).' 
        },
        'sjf': { 
            name: 'Shortest Job First (SJF)', 
            short: 'Non-preemptive. Shortest burst time runs next.',
            desc: 'The process with the smallest burst time is executed next. This is proven to be optimal for minimizing average waiting time, but it can lead to starvation for long processes. This is the non-preemptive version.' 
        },
        'srtf': { 
            name: 'Shortest Remaining Time First (SRTF)',
            short: 'Preemptive version of SJF.',
            desc: 'The preemptive version of SJF. If a new process arrives with a remaining time shorter than the current running process, the CPU is preempted and given to the new, shorter process. Excellent for response time.' 
        },
        'rr': { 
            name: 'Round Robin (RR)',
            short: 'Preemptive. Each process gets a "time quantum".',
            desc: 'A preemptive algorithm where each process is given a small unit of CPU time (time quantum). If the process doesn\'t finish, it\'s moved to the end of the ready queue. Provides good fairness and response time.' 
        },
        'ljf': {
            name: 'Longest Job First (LJF)',
            short: 'Non-preemptive. Longest burst time runs next.',
            desc: 'The process with the longest burst time is executed next. This is a non-preemptive algorithm that is generally poor for average wait and turnaround times, but ensures that long jobs are finished quickly.'
        },
        'lrtf': {
            name: 'Longest Remaining Time First (LRTF)',
            short: 'Preemptive version of LJF.',
            desc: 'The preemptive version of LJF. The process with the longest remaining burst time is given the CPU. If a new process arrives with a longer remaining time, it may preempt the current one. Tends to have poor performance metrics.'
        },
        'priority_np': { 
            name: 'Priority (Non-Preemptive)',
            short: 'Non-preemptive. Process with highest priority runs.',
            desc: 'Each process is assigned a priority (lower number = higher priority). The scheduler selects the waiting process with the highest priority to run next. Can lead to starvation of low-priority processes.' 
        },
        'priority_p': { 
            name: 'Priority (Preemptive)',
            short: 'Preemptive. Highest priority process runs.',
            desc: 'A preemptive version of priority scheduling. If a new, higher-priority process arrives, it will preempt the currently running process. This is common in real-time operating systems.' 
        },
        'hrrn': { 
            name: 'Highest Response Ratio Next (HRRN)',
            short: 'Non-preemptive. Balances wait time and burst time.',
            desc: 'A non-preemptive algorithm that selects the process with the highest "Response Ratio" ( (Waiting Time + Burst Time) / Burst Time ). This approach favors shorter jobs but also prevents starvation by increasing the ratio of long-waiting jobs.' 
        }
    };


    
     // Initializes the algorithm selection cards
    
    function initializeAlgoCards() {
        algorithmGrid.innerHTML = ''; // Clear any existing
        for (const [key, value] of Object.entries(ALGO_DETAILS)) {
            const card = document.createElement('div');
            card.className = 'algo-card';
            card.dataset.value = key;
            card.innerHTML = `
                <h4>${value.name}</h4>
                <p>${value.short}</p>
            `;
            if (key === selectedAlgorithm) {
                card.classList.add('active');
                updateAlgoDetails(key); // Update details for default
            }
            algorithmGrid.appendChild(card);
        }
    }
    

     // Handles clicking on an algorithm card
     
    function handleAlgoCardClick(e) {
        const card = e.target.closest('.algo-card');
        if (!card) return; // Clicked outside a card
        
        selectedAlgorithm = card.dataset.value;
        
        // Update active state
        algorithmGrid.querySelectorAll('.algo-card').forEach(c => {
            c.classList.remove('active');
        });
        card.classList.add('active');
        
        // Update details box
        updateAlgoDetails(selectedAlgorithm);
        
        // Show/hide Time Quantum
        if (selectedAlgorithm === 'rr') {
            tqInputContainer.classList.remove('hidden');
        } else {
            tqInputContainer.classList.add('hidden');
        }
    }

    
    // Updates the algorithm details box
     
    function updateAlgoDetails(algoKey) {
        const details = ALGO_DETAILS[algoKey];
        if (!details) return;
        
        algoDetailsBox.innerHTML = `
            <h5>${details.name}</h5>
            <p>${details.desc}</p>
        `;
    }


    
     // Adds a new row to the process input list
     
    function addProcessRow(at = 0, bt = 1, pri = 0) {
        const pid = processIdCounter++;
        const row = document.createElement('div');
        row.className = 'process-row';
        // Added classes for new grid layout
        row.innerHTML = `
            <div class="pr-at">
                <label>Arrival Time (AT)</label>
                <input type="number" value="${at}" min="0" class="at-input">
            </div>
            <div class="pr-bt">
                <label>Burst Time (BT)</label>
                <input type="number" value="${bt}" min="1" class="bt-input">
            </div>
            <div class="pr-pri">
                <label>Priority (Pri)</label>
                <input type="number" value="${pri}" min="0" class="pri-input">
            </div>
            <button class="remove-btn btn btn-danger pr-btn">
                Remove
            </button>
        `;
        
        // Add event listener for the remove button
        row.querySelector('.remove-btn').addEventListener('click', () => {
            row.remove();
        });
        
        processList.appendChild(row);
    }

    
    // Gathers process data from the DOM, runs the simulation, and displays results.
     
    function runSimulation() {
        // 1. Clear errors and show spinner
        errorMessage.textContent = '';
        runBtn.disabled = true;
        runSpinner.classList.remove('hidden');
        resultsContainer.classList.add('hidden');

        // 2. Get and validate inputs
        const originalProcesses = [];
        const processRows = processList.querySelectorAll('.process-row');
        
        if (processRows.length === 0) {
            showError("Please add at least one process.");
            return;
        }

        let validationError = false;
        processRows.forEach((row, index) => {
            const at = parseInt(row.querySelector('.at-input').value);
            const bt = parseInt(row.querySelector('.bt-input').value);
            const priority = parseInt(row.querySelector('.pri-input').value);
            
            if (isNaN(at) || isNaN(bt) || isNaN(priority)) {
                showError("Please enter valid numbers for all fields.");
                validationError = true;
                return;
            }
            if (at < 0) {
                 showError("Arrival Time cannot be negative.");
                validationError = true;
                return;
            }
            if (bt < 1) {
                showError("Burst Time must be at least 1.");
                validationError = true;
                return;
            }

            originalProcesses.push({
                pid: index + 1,
                at: at,
                bt: bt,
                priority: priority,
                rem_bt: bt,
                ct: 0,
                tat: 0,
                wt: 0,
                res_t: 0,
                start_t: -1,
                completed: 0
            });
        });
        
        if (validationError) {
            runBtn.disabled = false;
            runSpinner.classList.add('hidden');
            return;
        }

        const algorithm = selectedAlgorithm; // Use the state variable
        const algorithmName = ALGO_DETAILS[algorithm].name;
        let tq = parseInt(timeQuantumInput.value) || 1;
        
        if (algorithm === 'rr' && tq < 1) {
            showError("Time Quantum must be at least 1.");
            return;
        }

        // 3. Create a deep copy for the simulation to modify
        let processes = JSON.parse(JSON.stringify(originalProcesses));
        let ganttChartData = [];

        // 4. Run the selected algorithm
        setTimeout(() => {
            try {
                switch (algorithm) {
                    case 'fcfs':        runFCFS(processes, ganttChartData);       break;
                    case 'sjf':         runSJF(processes, ganttChartData);        break;
                    case 'srtf':        runSRTF(processes, ganttChartData);       break;
                    case 'rr':          runRR(processes, tq, ganttChartData);     break;
                    case 'ljf':         runLJF(processes, ganttChartData);        break;
                    case 'lrtf':        runLRTF(processes, ganttChartData);       break;
                    case 'priority_np': runPriorityNP(processes, ganttChartData); break;
                    case 'priority_p':  runPriorityP(processes, ganttChartData);  break;
                    case 'hrrn':        runHRRN(processes, ganttChartData);       break;
                }
                
                // 5. Display results
                displayResults(processes, algorithmName, ganttChartData);
            
            } catch (e) {
                showError("An error occurred during simulation: " + e.message);
                console.error(e);
            } finally {
                // 6. Hide spinner and re-enable button
                runBtn.disabled = false;
                runSpinner.classList.add('hidden');
            }
        }, 50); // Small delay to ensure spinner renders
    }

    
    //  Displays an error message to the user.
     
    function showError(message) {
        errorMessage.textContent = message;
        runBtn.disabled = false;
        runSpinner.classList.add('hidden');
    }

    
    //Helper function to add a block to the Gantt chart, merging if possible.
     
    function addToGantt(ganttData, pid, startTime, duration = 1) {
        if (duration <= 0) return; // Don't add zero-duration blocks
        const endTime = startTime + duration;
        if (ganttData.length > 0 && ganttData[ganttData.length - 1].pid === pid && ganttData[ganttData.length - 1].end === startTime) {
            // Extend the last block
            ganttData[ganttData.length - 1].end = endTime;
        } else {
            // Add a new block
            ganttData.push({ pid: pid, start: startTime, end: endTime });
        }
    }


    //  Scheduling Algorithms 

    // 1. FCFS
    function runFCFS(processes, ganttChartData) {
        processes.sort((a, b) => a.at - b.at);
        let currentTime = 0;
        for (const p of processes) {
            if (currentTime < p.at) {
                addToGantt(ganttChartData, 'IDLE', currentTime, p.at - currentTime);
                currentTime = p.at;
            }
            p.start_t = currentTime;
            p.ct = currentTime + p.bt;
            addToGantt(ganttChartData, p.pid, currentTime, p.bt);
            currentTime = p.ct;
            p.completed = 1; 
        }
    }

    // 2. SJF (Non-Preemptive)
    function runSJF(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let min_bt = Infinity;
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    if (processes[i].bt < min_bt) {
                        min_bt = processes[i].bt;
                        idx = i;
                    } else if (processes[i].bt === min_bt && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                p.start_t = currentTime;
                p.ct = currentTime + p.bt;
                p.completed = 1;
                addToGantt(ganttChartData, p.pid, currentTime, p.bt);
                completed++;
                currentTime = p.ct;
            } else {
                let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }

    // 3. SRTF (Preemptive)
    function runSRTF(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let min_rem_bt = Infinity;
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    if (processes[i].rem_bt < min_rem_bt) {
                        min_rem_bt = processes[i].rem_bt;
                        idx = i;
                    } else if (processes[i].rem_bt === min_rem_bt && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                if (p.start_t === -1) {
                    p.start_t = currentTime;
                }
                addToGantt(ganttChartData, p.pid, currentTime, 1);
                p.rem_bt--;
                currentTime++;
                if (p.rem_bt === 0) {
                    p.ct = currentTime;
                    p.completed = 1;
                    completed++;
                }
            } else {
                let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                 if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }

    // 4. Round Robin
    function runRR(processes, tq, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        let queue = [];
        let pIndex = 0;
        
        let sortedByArrival = [...processes].sort((a,b) => a.at - b.at);
        
        while (completed < n) {
            while(pIndex < n && sortedByArrival[pIndex].at <= currentTime) {
                queue.push(sortedByArrival[pIndex++]);
            }
            
            if (queue.length > 0) {
                const p = queue.shift();
                
                if (p.start_t === -1) {
                    p.start_t = currentTime;
                }
                
                const runTime = Math.min(p.rem_bt, tq);
                addToGantt(ganttChartData, p.pid, currentTime, runTime);
                p.rem_bt -= runTime;
                currentTime += runTime;

                while(pIndex < n && sortedByArrival[pIndex].at <= currentTime) {
                    queue.push(sortedByArrival[pIndex++]);
                }
                
                if (p.rem_bt === 0) {
                    p.ct = currentTime;
                    p.completed = 1;
                    completed++;
                } else {
                    queue.push(p);
                }
            } else if (pIndex < n) {
                let nextArrivalTime = sortedByArrival[pIndex].at;
                addToGantt(ganttChartData, 'IDLE', currentTime, nextArrivalTime - currentTime);
                currentTime = nextArrivalTime;
            } else {
                if (completed < n) {
                     let allArrivedButNotDone = true;
                     for(let i=0; i<n; i++) {
                        if(processes[i].completed === 0) allArrivedButNotDone = false;
                     }
                     if(allArrivedButNotDone) break; 

                    let nextArrival = Infinity;
                    for(let i=0; i<n; i++) {
                        if(processes[i].completed === 0) {
                            nextArrival = Math.min(nextArrival, processes[i].at);
                        }
                    }
                    if(nextArrival > currentTime && nextArrival !== Infinity) {
                         addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                         currentTime = nextArrival;
                    } else {
                        currentTime++;
                        if (currentTime > 20000) break; 
                    }
                }
            }
        }
    }
    
    // 5. LJF (Non-Preemptive)
    function runLJF(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let max_bt = -1;
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    if (processes[i].bt > max_bt) {
                        max_bt = processes[i].bt;
                        idx = i;
                    } else if (processes[i].bt === max_bt && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                p.start_t = currentTime;
                p.ct = currentTime + p.bt;
                p.completed = 1;
                addToGantt(ganttChartData, p.pid, currentTime, p.bt);
                completed++;
                currentTime = p.ct;
            } else {
                 let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }

    // 6. LRTF (Preemptive)
    function runLRTF(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let max_rem_bt = -1;
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    if (processes[i].rem_bt > max_rem_bt) {
                        max_rem_bt = processes[i].rem_bt;
                        idx = i;
                    } else if (processes[i].rem_bt === max_rem_bt && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                if (p.start_t === -1) {
                    p.start_t = currentTime;
                }
                addToGantt(ganttChartData, p.pid, currentTime, 1);
                p.rem_bt--;
                currentTime++;
                if (p.rem_bt === 0) {
                    p.ct = currentTime;
                    p.completed = 1;
                    completed++;
                }
            } else {
                 let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                 if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }

    // 7. Priority (Non-Preemptive)
    function runPriorityNP(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let highest_pri = Infinity; // Lower number = higher priority
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    if (processes[i].priority < highest_pri) {
                        highest_pri = processes[i].priority;
                        idx = i;
                    } else if (processes[i].priority === highest_pri && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                p.start_t = currentTime;
                p.ct = currentTime + p.bt;
                p.completed = 1;
                addToGantt(ganttChartData, p.pid, currentTime, p.bt);
                completed++;
                currentTime = p.ct;
            } else {
                 let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }

    // 9. Priority (Preemptive)
    function runPriorityP(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let highest_pri = Infinity;
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    if (processes[i].priority < highest_pri) {
                        highest_pri = processes[i].priority;
                        idx = i;
                    } else if (processes[i].priority === highest_pri && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                if (p.start_t === -1) {
                    p.start_t = currentTime;
                }
                addToGantt(ganttChartData, p.pid, currentTime, 1);
                p.rem_bt--;
                currentTime++;
                if (p.rem_bt === 0) {
                    p.ct = currentTime;
                    p.completed = 1;
                    completed++;
                }
            } else {
                 let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                 if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }

    // 10. HRRN (Non-Preemptive)
    function runHRRN(processes, ganttChartData) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        while (completed < n) {
            let idx = -1;
            let highest_rr = -1.0;
            for (let i = 0; i < n; i++) {
                if (processes[i].at <= currentTime && processes[i].completed === 0) {
                    let waitingTime = currentTime - processes[i].at;
                    let responseRatio = (waitingTime + processes[i].bt) / processes[i].bt;
                    if (responseRatio > highest_rr) {
                        highest_rr = responseRatio;
                        idx = i;
                    } else if (responseRatio === highest_rr && (idx === -1 || processes[i].at < processes[idx].at)) {
                        idx = i; // FCFS Tie-breaker
                    }
                }
            }
            if (idx !== -1) {
                const p = processes[idx];
                p.start_t = currentTime;
                p.ct = currentTime + p.bt;
                p.completed = 1;
                addToGantt(ganttChartData, p.pid, currentTime, p.bt);
                completed++;
                currentTime = p.ct;
            } else {
                 let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(processes[i].completed === 0) {
                        nextArrival = Math.min(nextArrival, processes[i].at);
                    }
                }
                if (nextArrival > currentTime && nextArrival !== Infinity) {
                     addToGantt(ganttChartData, 'IDLE', currentTime, nextArrival - currentTime);
                     currentTime = nextArrival;
                } else {
                    addToGantt(ganttChartData, 'IDLE', currentTime, 1);
                    currentTime++;
                }
            }
        }
    }


    /**
     * Renders the final results table and averages.
     */
    function displayResults(processes, algorithmName, ganttChartData) {
        resultsContainer.classList.remove('hidden');
        resultsTitle.textContent = `Results: ${algorithmName}`;
        
        // Clear previous results
        resultsTableContainer.innerHTML = '';
        resultsAverages.innerHTML = '';
        ganttChartContainer.innerHTML = '';
        ganttLegendContainer.innerHTML = '';

        let total_tat = 0;
        let total_wt = 0;
        let total_res_t = 0;

        // Create Table
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>PID</th>
                        <th>AT</th>
                        <th>BT</th>
                        <th>Pri</th>
                        <th>CT</th>
                        <th>TAT</th>
                        <th>WT</th>
                        <th>RT</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Sort processes by PID for consistent table display
        processes.sort((a,b) => a.pid - b.pid);

        for (const p of processes) {
            p.tat = p.ct - p.at;
            p.wt = p.tat - p.bt;
            p.res_t = (p.start_t === -1) ? 0 : p.start_t - p.at;
            
            total_tat += p.tat;
            total_wt += p.wt;
            total_res_t += p.res_t;

            tableHTML += `
                <tr>
                    <td>${p.pid}</td>
                    <td>${p.at}</td>
                    <td>${p.bt}</td>
                    <td>${p.priority}</td>
                    <td>${p.ct}</td>
                    <td>${p.tat}</td>
                    <td>${p.wt}</td>
                    <td>${p.res_t}</td>
                </tr>
            `;
        }
        
        tableHTML += `</tbody></table>`;
        resultsTableContainer.innerHTML = tableHTML;

        // Display Averages
        const n = processes.length;
        resultsAverages.innerHTML = `
            <p><strong>Average Turnaround Time:</strong> ${(total_tat / n).toFixed(2)}</p>
            <p><strong>Average Waiting Time:</strong> ${(total_wt / n).toFixed(2)}</p>
            <p><strong>Average Response Time:</strong> ${(total_res_t / n).toFixed(2)}</p>
        `;

        // Display Gantt Chart
        displayGanttChart(processes, ganttChartData);
    }

    
    // Renders the Gantt chart and its legend.
     
    function displayGanttChart(processes, ganttData) {
        if (!ganttData || ganttData.length === 0) return;

        const totalDuration = ganttData[ganttData.length - 1].end;
        
        // --- Define Colors ---
        const colors = [
            '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', 
            '#1abc9c', '#e67e22', '#34495e', '#d35400', '#c0392b'
        ];
        const colorMap = new Map();
        
        // Use original process list for legend to get all PIDs
        processes.forEach((p, i) => {
            colorMap.set(p.pid, colors[i % colors.length]);
        });
        
        //  Create Chart Blocks 
        for (const block of ganttData) {
            const blockEl = document.createElement('div');
            const duration = block.end - block.start;
            const widthPercent = (duration / totalDuration) * 100;
            
            blockEl.className = 'gantt-block';
            // Use flex-basis for width calculation, allowing min-width to work
            blockEl.style.flexBasis = `${widthPercent}%`;
            
            if (block.pid === 'IDLE') {
                blockEl.classList.add('gantt-idle');
                blockEl.textContent = `IDLE`;
            } else {
                blockEl.style.backgroundColor = colorMap.get(block.pid);
                blockEl.textContent = `P${block.pid}`;
            }
            
            blockEl.title = `Process ${block.pid} (Time: ${block.start} - ${block.end}, Duration: ${duration})`;
            ganttChartContainer.appendChild(blockEl);
        }

        // --- Create Legend ---
        for (const p of processes) {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${colorMap.get(p.pid)}"></div>
                <span>P${p.pid}</span>
            `;
            ganttLegendContainer.appendChild(legendItem);
        }
        // Add IDLE legend
        const idleLegend = document.createElement('div');
        idleLegend.className = 'legend-item';
        idleLegend.innerHTML = `
            <div class="legend-color" style="background-color: #e0e0e0"></div>
            <span>IDLE</span>
        `;
        ganttLegendContainer.appendChild(idleLegend);
    }
    
    // --- Scroll Listeners ---
    heroTryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('simulator-app').scrollIntoView({ behavior: 'smooth' });
    });
    
    heroLearnBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
    });

    // --- Initial Setup ---
    addProcessBtn.addEventListener('click', () => addProcessRow(0, 1, 0));
    algorithmGrid.addEventListener('click', handleAlgoCardClick);
    runBtn.addEventListener('click', runSimulation);

    // Add some default processes to start
    addProcessRow(0, 5, 1);
    addProcessRow(1, 3, 2);
    addProcessRow(2, 8, 1);
    addProcessRow(3, 6, 3);
    
    // Initialize the UI
    initializeAlgoCards();
});