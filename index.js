       document.addEventListener('DOMContentLoaded', function() {
            // --- Fixed Header on Scroll ---
            const header = document.getElementById('main-header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // --- Mobile Menu Toggle ---
            const menuToggle = document.getElementById('menu-toggle');
            const mainNav = document.getElementById('main-nav');
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
            });
            
            // Close menu when a link is clicked
            const navLinks = document.querySelectorAll('.main-nav a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                    }
                });
            });

            // --- Utility Function: Get Date ---
            function getTodayDate() {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // --- Daily Tip Modal (Updated with One-Tip-Per-Day Lock) ---
            const modal = document.getElementById('tipModal');
            const openBtn = document.getElementById('dailyTipBtn');
            const closeBtn = document.getElementById('closeModalBtn');
            const tipText = document.getElementById('tipText');

            // 1. القائمة الكاملة للنصائح (ثابتة في هذا الإصدار)
            const allTips = [
                { id: 1, text: "القليل الدائم خير من الكثير المنقطع. استمرارية صغيرة تبني جبلاً من الإنجاز." },
                { id: 2, text: "لا تنتظر الظروف المثالية لتبدأ، ابدأ الآن بما تملك." },
                { id: 3, text: "اجعل صلاتك استراحة من هموم الدنيا، لا مهمة تريد إنهاءها." },
                { id: 4, text: "عشر دقائق من المشي السريع يومياً أفضل من لا شيء على الإطلاق." },
                { id: 5, text: "صفحة واحدة من القرآن كل يوم تضيء قلبك وتومئ دربك." },
                { id: 6, text: "النجاح ليس وجهة، بل رحلة من التحسينات الصغيرة المستمرة." },
                { id: 7, text: "صحة علاقاتك الاجتماعية هي مرآة لصحتك النفسية." },
                { id: 8, text: "عند الفتور، تذكر ركن المداومة: عد فوراً ولا تنتظر بداية الأسبوع." },
                { id: 9, text: "ابدأ يومك بالركيزة الأقوى (الصلاة والأوراد) لتثبيت باقي الأركان." },
                { id: 10, text: "خصص وقتاً ثابتاً (ولو 10 دقائق) لطلب العلم يومياً، حتى لو كنت مرهقاً." }
            ];

            // 2. اختيار وعرض نصيحة جديدة (نصيحة واحدة في اليوم)
            openBtn.onclick = function() {
                const today = getTodayDate();
                
                // 1. التحقق من النصيحة المسجلة لليوم (المفتاح: displayedTips)
                let displayedTipsData = JSON.parse(localStorage.getItem('displayedTips')) || { date: '', id: null, text: '' };
                
                let selectedTip = null;
                
                // إذا كان التاريخ مختلفًا، أو لم يتم اختيار نصيحة اليوم
                if (displayedTipsData.date !== today || displayedTipsData.id === null) {
                    
                    // (أ) فلترة النصائح غير المكررة (على مستوى جميع الأيام) (المفتاح: tipsHistoryIds)
                    const historyIds = JSON.parse(localStorage.getItem('tipsHistoryIds')) || []; 
                    let availableTips = allTips.filter(tip => !historyIds.includes(tip.id));

                    // إذا انتهت النصائح غير المكررة، أعد استخدام القائمة بأكملها
                    if (availableTips.length === 0) {
                        availableTips = allTips;
                        localStorage.setItem('tipsHistoryIds', JSON.stringify([])); 
                    }
                    
                    // (ب) اختيار نصيحة عشوائية من القائمة المتاحة
                    const randomIndex = Math.floor(Math.random() * availableTips.length);
                    selectedTip = availableTips[randomIndex];

                    // (ج) حفظ النصيحة الجديدة لليوم
                    displayedTipsData = { 
                        date: today, 
                        id: selectedTip.id, 
                        text: selectedTip.text 
                    };
                    localStorage.setItem('displayedTips', JSON.stringify(displayedTipsData));

                    // (د) إضافة المعرّف للسجل التاريخي لمنع التكرار قدر الإمكان
                    historyIds.push(selectedTip.id);
                    localStorage.setItem('tipsHistoryIds', JSON.stringify(historyIds));
                    
                } else {
                    // إذا كانت هناك نصيحة مسجلة بالفعل لهذا اليوم، نعرضها مجددًا
                    selectedTip = { id: displayedTipsData.id, text: displayedTipsData.text };
                    
                    // رسالة توضح أنه قد تم عرض النصيحة مسبقاً اليوم
                    tipText.innerHTML = `**لقد تم بالفعل تحديد نصيحة اليوم:**<br>${selectedTip.text}`;
                    modal.style.display = "flex";
                    return; // نخرج من الدالة بعد عرض النصيحة المسجلة
                }

                // عرض النصيحة الجديدة/المسجلة
                tipText.textContent = selectedTip.text;
                modal.style.display = "flex";
            }

            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
            
            // --- Rating Modal: To-Do List, Local Storage & Charts ---
            const ratingModal = document.getElementById('ratingModal');
            const openRatingBtn = document.getElementById('openRatingModalBtn');
            const closeRatingBtn = document.getElementById('closeRatingModalBtn');
            const ratingForm = document.getElementById('ratingForm');
            const totalRatingResult = document.getElementById('totalRatingResult');

            const chartsModal = document.getElementById('chartsModal');
            const openFullDashboardBtn = document.getElementById('openFullDashboardBtn'); // Desktop ID
            const openMobileChartBtn = document.getElementById('openMobileChartBtn'); // Mobile ID
            const closeChartsBtn = document.getElementById('closeChartsModalBtn');
            let myProgressChart = null; // Chart for line graph
            let myPillarChart = null;   // Chart for completion pie chart

            // 1. Manage To-Do List (Rating Modal)
            // Open Rating Modal and load today's saved data
            openRatingBtn.onclick = function(e) {
                e.preventDefault();
                totalRatingResult.textContent = '';
                const today = getTodayDate();
                const storedData = JSON.parse(localStorage.getItem('al-khumasiyah-data')) || {};
                const todayData = storedData[today] || {};
                
                // Load saved checkboxes state
                document.querySelectorAll('#ratingForm input[type="checkbox"]').forEach((checkbox, index) => {
                    checkbox.checked = !!todayData[`task-${index + 1}`]; 
                });
                
                ratingModal.style.display = "flex";
            }

            closeRatingBtn.onclick = function() {
                ratingModal.style.display = "none";
            }

            // Handle form submission and save to Local Storage
            ratingForm.onsubmit = function(e) {
                e.preventDefault();
                
                const today = getTodayDate();
                let completedTasks = 0;
                const taskData = {};
                
                // Collect data and count completed tasks
                document.querySelectorAll('#ratingForm input[type="checkbox"]').forEach((checkbox, index) => {
                    const taskKey = `task-${index + 1}`;
                    taskData[taskKey] = checkbox.checked;
                    if (checkbox.checked) {
                        completedTasks++;
                    }
                });
                
                const totalTasks = 5;
                const score = (completedTasks / totalTasks) * 5; // Score out of 5
                
                // Get all historical data
                const storedData = JSON.parse(localStorage.getItem('al-khumasiyah-data')) || {};
                
                // Save today's result
                storedData[today] = {
                    score: score,
                    completed: completedTasks,
                    details: taskData,
                    date: today
                };
                
                // Save back to Local Storage
                localStorage.setItem('al-khumasiyah-data', JSON.stringify(storedData));
                
                totalRatingResult.innerHTML = `تم حفظ التقييم بنجاح! أنجزت ${completedTasks} / 5 أركان.`;
                
                // Close modal after a short delay
                setTimeout(() => {
                    ratingModal.style.display = "none";
                }, 1500);
            }

            // 2. Dashboard Function
            // Function to calculate and draw the entire dashboard
            function drawDashboard() {
                const storedData = JSON.parse(localStorage.getItem('al-khumasiyah-data')) || {};
                const allDates = Object.keys(storedData).sort();
                
                const today = new Date();
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

                const lastThirtyDaysData = allDates.filter(dateStr => {
                    const date = new Date(dateStr);
                    return date >= thirtyDaysAgo;
                }).map(dateStr => storedData[dateStr]);
                
                // --- 1. KPI Calculation & Pillar Analysis ---
                let totalScoreSum = 0;
                let dailyCounts = lastThirtyDaysData.length;
                
                // Track completion for each of the 5 pillars (tasks)
                const pillarCompletionCounts = {
                    '1. الصلاة': 0,
                    '2. الأعمال الدائمة': 0,
                    '3. طلب العلم': 0,
                    '4. ترويح ورياضة': 0,
                    '5. صلة اجتماعية': 0
                };
                
                lastThirtyDaysData.forEach(day => {
                    totalScoreSum += day.score;
                    if (day.details) {
                        // Check if pillar was completed (using task-1, task-2, etc. keys)
                        if (day.details['task-1']) pillarCompletionCounts['1. الصلاة']++;
                        if (day.details['task-2']) pillarCompletionCounts['2. الأعمال الدائمة']++;
                        if (day.details['task-3']) pillarCompletionCounts['3. طلب العلم']++;
                        if (day.details['task-4']) pillarCompletionCounts['4. ترويح ورياضة']++;
                        if (day.details['task-5']) pillarCompletionCounts['5. صلة اجتماعية']++;
                    }
                });
                
                const averageScore = dailyCounts > 0 ? (totalScoreSum / dailyCounts) : 0;
                
                // Determine Best and Worst Pillar (based on completion count)
                let bestPillar = 'لا بيانات';
                let worstPillar = 'لا بيانات';
                let maxCount = -1;
                let minCount = dailyCounts + 1;

                if (dailyCounts > 0) {
                    for (const [pillarName, count] of Object.entries(pillarCompletionCounts)) {
                        if (count > maxCount) {
                            maxCount = count;
                            bestPillar = pillarName.substring(3); // Remove the number prefix
                        }
                        if (count < minCount) {
                            minCount = count;
                            worstPillar = pillarName.substring(3);
                        }
                    }
                }
                
                // --- 2. Update KPI Cards ---
                document.getElementById('avgScoreDisplay').textContent = `${averageScore.toFixed(2)} / 5`;
                document.getElementById('bestPillarDisplay').textContent = bestPillar;
                document.getElementById('worstPillarDisplay').textContent = worstPillar;
                
                // --- 3. Line Chart (Progress Over Time) ---
                const labels = lastThirtyDaysData.map(data => data.date);
                const scores = lastThirtyDaysData.map(data => data.score);
                
                if (myProgressChart) myProgressChart.destroy();
                
                myProgressChart = new Chart(document.getElementById('progressChart'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'متوسط تقييم الأركان اليومي (من 5)',
                            data: scores,
                            borderColor: 'rgb(44, 62, 80)', // Primary Blue
                            backgroundColor: 'rgba(44, 62, 80, 0.2)',
                            tension: 0.4,
                            fill: true,
                        }]
                    },
                    options: {
                        responsive: true,
                        aspectRatio: (window.innerWidth > 768) ? 2.5 : 1.5, // Wider on desktop
                        scales: {
                            y: { beginAtZero: true, max: 5, title: { display: true, text: 'التقييم (من 5)' } }
                        }
                    }
                });
                
                // --- 4. Doughnut Chart (Pillar Completion Breakdown) ---
                if (window.innerWidth > 768) { // Only draw the Doughnut Chart on Desktop
                    const pillarNames = Object.keys(pillarCompletionCounts).map(name => name.substring(3)); // Names without number
                    const pillarData = Object.values(pillarCompletionCounts);
                    
                    if (myPillarChart) myPillarChart.destroy();

                    myPillarChart = new Chart(document.getElementById('pillarCompletionChart'), {
                        type: 'doughnut',
                        data: {
                            labels: pillarNames,
                            datasets: [{
                                data: pillarData,
                                backgroundColor: [
                                    '#3498db', // 1. الصلاة
                                    '#2ecc71', // 2. الأعمال الدائمة
                                    '#9b59b6', // 3. طلب العلم
                                    '#f1c40f', // 4. ترويح ورياضة
                                    '#e74c3c'  // 5. صلة اجتماعية
                                ],
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            aspectRatio: 1, // Square shape
                            plugins: {
                                legend: {
                                    position: 'right',
                                    rtl: true,
                                    labels: {
                                        usePointStyle: true
                                    }
                                }
                            }
                        }
                    });
                }
            }
            
            // Open Dashboard (Desktop Button)
            openFullDashboardBtn.onclick = function(e) {
                e.preventDefault();
                chartsModal.style.display = "flex";
                drawDashboard(); 
            }

            // Open Simple Chart (Mobile Button)
            openMobileChartBtn.onclick = function(e) {
                e.preventDefault();
                chartsModal.style.display = "flex";
                drawDashboard(); 
            }

            // Close Dashboard/Charts Modal
            closeChartsBtn.onclick = function() {
                chartsModal.style.display = "none";
            }

            // Handle clicking outside the modals
            window.onclick = function(event) {
                if (event.target == modal) { 
                    modal.style.display = "none";
                }
                if (event.target == ratingModal) { 
                    ratingModal.style.display = "none";
                }
                if (event.target == chartsModal) { 
                    chartsModal.style.display = "none";
                }
            }
        });
    