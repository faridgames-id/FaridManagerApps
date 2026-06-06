
        // SUPABASE CONFIGURATION
        const supabaseUrl = 'https://vneeugjoqtdlldtylddt.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWV1Z2pvcXRkbGxkdHlsZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTQ3MDcsImV4cCI6MjA5NTk3MDcwN30.jb4E8XThylj_X9-LOOIXgV9yneVg644mWSMH_n8IoeQ';
        
        let supabaseClient;
        try {
            if(!window.supabase) throw new Error("Supabase Library tidak termuat! Pastikan koneksi internet aktif.");
            supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        } catch(e) {
            alert('CRITICAL ERROR: ' + e.message);
            console.error(e);
        }
        
        // Manual hash parsing as fallback
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token && refresh_token) {
                alert('Mendeteksi token dari Google! Sedang memproses login...');
                supabaseClient.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
                    if (error) alert("Error saat membaca token: " + error.message);
                    else {
                        window.location.hash = ''; // clear hash
                    }
                });
            }
        }

        supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                alert('Session Error: ' + error.message);
            }
            if (session) {
                alert('Berhasil masuk! Selamat datang, ' + session.user.email);
                currentUser = session.user;
                document.getElementById('supabaseLoginOverlay').style.opacity = '0';
                setTimeout(() => document.getElementById('supabaseLoginOverlay').style.display = 'none', 500);
                try {
                    loadData();
                    if(typeof renderTable === 'function') { renderTable('accounts'); renderTable('sales'); }
                } catch(e) { alert("Error load data: " + e.message); }
            }
        });

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                currentUser = session.user;
                document.getElementById('supabaseLoginOverlay').style.opacity = '0';
                setTimeout(() => document.getElementById('supabaseLoginOverlay').style.display = 'none', 500);
                try {
                    loadData();
                    if(typeof renderTable === 'function') { renderTable('accounts'); renderTable('sales'); }
                } catch(e) { console.error(e); }
            } else {
                currentUser = null;
                document.getElementById('supabaseLoginOverlay').style.display = 'flex';
                document.getElementById('supabaseLoginOverlay').style.opacity = '1';
            }
        });

        // Data storage
        let accounts = [];
        let sales = [];
        let buyerSearchAccounts = []; // Separate storage for buyer search accounts (not personal stock)
        let keuanganTransactions = []; // Financial transactions for calendar
        let wishlistItems = []; // Wishlist for business expansion
        let jurnalBisnis = []; // Journal / Business notes

        // Generate unique ID
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Format Rupiah input
        function formatRupiahInput(input) {
            const value = input.value.replace(/[^0-9]/g, '');
            if (value === '') {
                input.value = '';
                return;
            }
            const number = parseInt(value);
            input.value = 'Rp ' + new Intl.NumberFormat('id-ID').format(number);
        }

        // Parse Rupiah
        function parseRupiah(str) {
            return parseInt(str.replace(/[^0-9]/g, '')) || 0;
        }

        // Format Rupiah display
        function formatRupiah(number) {
            return 'Rp ' + new Intl.NumberFormat('id-ID', {
                minimumFractionDigits: 0
            }).format(number);
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }

        // Toggle custom keterangan input when "Tulis Sendiri" is selected
        function toggleCustomKeterangan(prefix) {
            const select = document.getElementById(prefix + 'Keterangan');
            const customInput = document.getElementById(prefix + 'KeteranganCustom');
            if (select.value === 'custom') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
                customInput.value = '';
            }
        }

        // Get keterangan value (handles custom option)
        function getKeteranganValue(prefix) {
            const select = document.getElementById(prefix + 'Keterangan');
            if (select.value === 'custom') {
                return document.getElementById(prefix + 'KeteranganCustom').value.trim() || '-';
            }
            return select.value || '-';
        }

        // Switch tab
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');

            // Update charts when statistik tab is opened
            if (tabId === 'statistik') {
                setTimeout(updateCharts, 100);
            }
        }

        // Switch sub-tab
        function switchSubTab(game, type) {
            // Hide all sub-tab contents for this game
            document.querySelectorAll(`[id^="${game}-"]`).forEach(content => {
                content.classList.remove('active');
            });
            
            // Deactivate all sub-tabs for this game
            const subTabs = document.querySelectorAll(`#${game === 'ff' ? 'stok-ff' : 'stok-ml'} .sub-tab`);
            subTabs.forEach(tab => tab.classList.remove('active'));
            
            // Show selected content
            document.getElementById(`${game}-${type}`).classList.add('active');
            
            // Activate selected tab
            const tabIndex = type === 'ready' ? 0 : type === 'terjual' ? 1 : 2;
            subTabs[tabIndex].classList.add('active');
        }

        // Initialize calendar on page load
        function initCalendar() {
            console.log('Initializing calendar...');
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const select = document.getElementById('calendarMonthSelect');
            
            if (!select) {
                console.error('calendarMonthSelect element not found');
                return;
            }
            
            // Clear and add options
            select.innerHTML = '<option value="">Pilih Bulan</option>';
            
            for (let year = 2026; year <= 2027; year++) {
                const startMonth = 0; // January = 0
                const endMonth = 11;

                for (let month = startMonth; month <= endMonth; month++) {
                    const option = document.createElement('option');
                    option.value = `${year}-${month}`;
                    option.textContent = `${monthNames[month]} ${year}`;
                    select.appendChild(option);
                }
            }
            
            console.log('Calendar initialized with', select.options.length, 'months');
            console.log('Current select value:', select.value);
        }

        // Save data to localStorage
        async function saveData() {
            try {
                localStorage.setItem('ffml_accounts', JSON.stringify(accounts));
                localStorage.setItem('ffml_sales', JSON.stringify(sales));
                localStorage.setItem('ffml_buyer_search', JSON.stringify(buyerSearchAccounts));
                localStorage.setItem('ffml_keuangan', JSON.stringify(keuanganTransactions));
                localStorage.setItem('ffml_wishlist', JSON.stringify(wishlistItems));
                localStorage.setItem('ffml_jurnal', JSON.stringify(jurnalBisnis));
                localStorage.setItem('ffml_lastSaved', new Date().toISOString());
            } catch (e) {
                console.error('Error saving local data:', e);
            }

            if(currentUser) {
                try {
                    const { error } = await supabaseClient
                        .from('user_app_data')
                        .upsert({
                            id: currentUser.id,
                            accounts: accounts,
                            sales: sales,
                            buyer_search: buyerSearchAccounts,
                            keuangan: keuanganTransactions,
                            wishlist: wishlistItems,
                            jurnal: jurnalBisnis,
                            updated_at: new Date().toISOString()
                        });
                    if (error) throw error;
                } catch (e) {
                    console.error('Supabase Sync Error:', e);
                }
            }
        }

        // Save wishlist item
        function saveWishlist() {
            const itemName = document.getElementById('wishlistItemName').value.trim();
            const category = document.getElementById('wishlistCategory').value;
            const budget = parseRupiah(document.getElementById('wishlistBudget').value);
            const priority = document.getElementById('wishlistPriority').value;
            const specs = document.getElementById('wishlistSpecs').value.trim();
            const source = document.getElementById('wishlistSource').value.trim();
            const notes = document.getElementById('wishlistNotes').value.trim();
            const status = document.getElementById('wishlistStatus').value;

            if (!itemName) {
                alert('⚠️ Nama barang harus diisi!');
                return;
            }

            const wishlistItem = {
                id: generateId(),
                itemName: itemName,
                category: category,
                budget: budget || 0,
                priority: priority,
                specs: specs || '-',
                source: source || '-',
                notes: notes || '-',
                status: status,
                dateAdded: new Date().toISOString().split('T')[0]
            };

            wishlistItems.push(wishlistItem);
            saveData();
            renderWishlist();

            // Clear form
            document.getElementById('wishlistItemName').value = '';
            document.getElementById('wishlistBudget').value = '';
            document.getElementById('wishlistSpecs').value = '';
            document.getElementById('wishlistSource').value = '';
            document.getElementById('wishlistNotes').value = '';

            alert('✅ Wishlist barang berhasil ditambahkan!');
        }

        // Render wishlist table
        function renderWishlist() {
            const tbody = document.getElementById('wishlistTable');
            if (!tbody) return;

            if (wishlistItems.length === 0) {
                tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><p>Belum ada wishlist barang. Tambahkan equipment yang Anda butuhkan untuk bisnis!</p></div></td></tr>`;
                updateWishlistSummary();
                return;
            }

            // Sort by priority (high > medium > low)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const sortedWishlist = [...wishlistItems].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

            tbody.innerHTML = sortedWishlist.map((item, i) => {
                const priorityBadge = item.priority === 'high' ? 
                    '<span style="background: #e74c3c; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">🔴 Urgent</span>' :
                    item.priority === 'medium' ? 
                    '<span style="background: #f39c12; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">🟡 Perlu</span>' :
                    '<span style="background: #27ae60; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">🟢 Nanti</span>';

                const statusBadge = item.status === 'planning' ? 
                    '<span style="background: #3498db; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">📋 Rencana</span>' :
                    item.status === 'saved' ? 
                    '<span style="background: #f1c40f; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">💰 Dana Siap</span>' :
                    item.status === 'ordered' ? 
                    '<span style="background: #9b59b6; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">🛒 Dipesan</span>' :
                    '<span style="background: #27ae60; color:var(--gray-800); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">✅ Terima</span>';

                const categoryBadge = item.category === 'hp' ? '📱 HP' :
                    item.category === 'tablet' ? '📱 Tablet' :
                    item.category === 'pc' ? '💻 PC/Laptop' :
                    item.category === 'network' ? '🌐 Network' :
                    item.category === 'accessories' ? '🎧 Aksesoris' :
                    item.category === 'software' ? '💿 Software' :
                    '📦 Lainnya';

                return `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${item.itemName}</strong></td>
                        <td>${categoryBadge}</td>
                        <td>${item.specs}</td>
                        <td style="font-weight: bold;">${formatRupiah(item.budget)}</td>
                        <td style="text-align: center;">${priorityBadge}</td>
                        <td style="text-align: center;">${statusBadge}</td>
                        <td>${item.source !== '-' ? '<a href="' + item.source + '" target="_blank" style="color: #3498db;">🔗 Link</a>' : '-'}</td>
                        <td>${item.notes}</td>
                        <td>${formatDate(item.dateAdded)}</td>
                        <td style="white-space: nowrap;">
                            <button class="btn btn-danger" onclick="deleteWishlist('${item.id}')" style="padding: 5px 10px; font-size: 0.8rem;" title="Hapus">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join('');

            updateWishlistSummary();
        }

        // Update wishlist summary cards
        function updateWishlistSummary() {
            document.getElementById('wishlistTotal').textContent = wishlistItems.length;
            document.getElementById('wishlistHighPriority').textContent = wishlistItems.filter(item => item.priority === 'high').length;
            
            const totalBudget = wishlistItems.reduce((sum, item) => sum + (item.budget || 0), 0);
            document.getElementById('wishlistTotalBudget').textContent = formatRupiah(totalBudget);
            
            document.getElementById('wishlistReceived').textContent = wishlistItems.filter(item => item.status === 'received').length;
        }

        // Delete wishlist item
        function deleteWishlist(id) {
            if (!confirm('Yakin ingin menghapus wishlist ini?')) return;
            wishlistItems = wishlistItems.filter(item => item.id !== id);
            saveData();
            renderWishlist();
        }

        // --- JURNAL BISNIS FUNCTIONS ---
        function tambahJurnal() {
            const date = document.getElementById('jurnalDate').value;
            const category = document.getElementById('jurnalCategory').value;
            const content = document.getElementById('jurnalContent').value.trim();

            if (!date || !content) {
                alert('⚠️ Harap isi tanggal dan isi catatan!');
                return;
            }

            const newJurnal = {
                id: generateId(),
                date: date,
                category: category,
                content: content,
                createdAt: new Date().toISOString()
            };

            jurnalBisnis.push(newJurnal);
            
            // Sort from newest to oldest
            jurnalBisnis.sort((a, b) => new Date(b.date) - new Date(a.date));

            saveData();
            renderJurnal();

            document.getElementById('jurnalContent').value = '';
            if (window.showToast) showToast('Jurnal berhasil disimpan!', 'success');
            else alert('✅ Jurnal berhasil disimpan!');
        }

        function renderJurnal() {
            const timeline = document.getElementById('jurnalTimeline');
            if (!timeline) return;

            if (jurnalBisnis.length === 0) {
                timeline.innerHTML = `<div style="color:#94a3b8; text-align:center; padding: 20px; font-style: italic;">Belum ada catatan jurnal bisnis. Mulai tulis perjalanan bisnismu!</div>`;
                return;
            }

            const catConfig = {
                'umum': { icon: '📝', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
                'target': { icon: '🎯', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                'masalah': { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
                'pencapaian': { icon: '🏆', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
            };

            timeline.innerHTML = jurnalBisnis.map(j => {
                const conf = catConfig[j.category] || catConfig['umum'];
                const dateObj = new Date(j.date);
                const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                
                return `
                    <div style="position: relative; padding: 20px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                        <!-- Timeline Dot -->
                        <div style="position: absolute; left: -29px; top: 25px; width: 16px; height: 16px; border-radius: 50%; background: ${conf.color}; box-shadow: 0 0 10px ${conf.color}, 0 0 0 4px rgba(15, 23, 42, 1);"></div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: ${conf.bg}; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                    ${conf.icon}
                                </div>
                                <div>
                                    <div style="color: #fff; font-weight: 700; font-size: 1.1rem; text-transform: capitalize;">${j.category}</div>
                                    <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 2px;">📅 ${formattedDate}</div>
                                </div>
                            </div>
                            <button onclick="deleteJurnal('${j.id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444'">Hapus</button>
                        </div>
                        <div style="color: #cbd5e1; font-size: 1rem; line-height: 1.6; white-space: pre-wrap; margin-top: 15px; padding-left: 50px;">${j.content}</div>
                    </div>
                `;
            }).join('');
        }

        function deleteJurnal(id) {
            if (!confirm('Yakin ingin menghapus jurnal ini?')) return;
            jurnalBisnis = jurnalBisnis.filter(j => j.id !== id);
            saveData();
            renderJurnal();
            if (window.showToast) showToast('Jurnal dihapus', 'info');
        }

        // Export data to JSON file
        function exportData() {
            const data = {
                accounts: accounts,
                sales: sales,
                buyerSearchAccounts: buyerSearchAccounts,
                keuanganTransactions: keuanganTransactions,
                wishlistItems: wishlistItems,
                jurnalBisnis: jurnalBisnis,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-akun-ffml-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✅ Data berhasil di-export!');
        }

        // Import data from JSON file
        function importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.accounts && data.sales) {
                        if (confirm(`Import ${data.accounts.length} akun dan ${data.sales.length} penjualan? Data saat ini akan ditimpa.`)) {
                            accounts = data.accounts;
                            sales = data.sales;
                            if (data.buyerSearchAccounts) {
                                buyerSearchAccounts = data.buyerSearchAccounts;
                            }
                            if (data.keuanganTransactions) {
                                keuanganTransactions = data.keuanganTransactions;
                            }
                            if (data.wishlistItems) {
                                wishlistItems = data.wishlistItems;
                            }
                            if (data.jurnalBisnis) {
                                jurnalBisnis = data.jurnalBisnis;
                            }
                            saveData();
                            renderAccounts();
                            renderSales();
                            renderWishlist();
                            updateDashboard();
                            searchBuyerAccounts();
                            renderKalenderKeuangan();
                            alert('✅ Data berhasil di-import!');
                        }
                    } else {
                        alert('⚠️ Format file tidak valid!');
                    }
                } catch (err) {
                    alert('⚠️ Error membaca file: ' + err.message);
                }
            };
            reader.readAsText(file);
        }

        function applyGlobalFilter() {
            const filterMonthVal = document.getElementById('globalFilterMonth').value;
            const filterYearVal = document.getElementById('globalFilterYear').value;
            const badge = document.getElementById('globalMonthFilterBadge');
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            if (filterMonthVal !== 'all') {
                badge.style.display = 'inline-block';
                badge.textContent = monthNames[parseInt(filterMonthVal)] + ' ' + filterYearVal;
            } else {
                badge.style.display = 'none';
            }

            // Update all views
            updateDashboard();
            updateStockSummary();
            updateCharts();
        }

        // Update dashboard
        function updateDashboard() {
            // Apply Global Filter
            const globalFilterMonth = document.getElementById('globalFilterMonth');
            const globalFilterYear = document.getElementById('globalFilterYear');
            
            let currentAccounts = accounts;
            if (globalFilterMonth && globalFilterMonth.value !== 'all') {
                const monthNum = parseInt(globalFilterMonth.value);
                const yearNum = parseInt(globalFilterYear.value);
                
                currentAccounts = accounts.filter(a => {
                    let match = false;
                    if (a.buyDate) {
                        const bParts = a.buyDate.split('-');
                        if (parseInt(bParts[0]) === yearNum && (parseInt(bParts[1]) - 1) === monthNum) match = true;
                    }
                    if (a.status === 'terjual' && a.sellDate) {
                        const sParts = a.sellDate.split('-');
                        if (parseInt(sParts[0]) === yearNum && (parseInt(sParts[1]) - 1) === monthNum) match = true;
                    }
                    return match;
                });
            }

            const ffAccounts = currentAccounts.filter(a => a.game === 'ff');
            const mlAccounts = currentAccounts.filter(a => a.game === 'ml');
            const activeAccounts = currentAccounts.filter(a => a.status === 'aktif');
            const soldAccounts = currentAccounts.filter(a => a.status === 'terjual');
            const cicilanAccounts = currentAccounts.filter(a => a.status === 'cicilan');

            const ffReadyCount = ffAccounts.filter(a => a.status === 'aktif').length;
            const mlReadyCount = mlAccounts.filter(a => a.status === 'aktif').length;

            // Update Cards
            document.getElementById('ffCount').textContent = ffAccounts.length;
            document.getElementById('mlCount').textContent = mlAccounts.length;
            document.getElementById('ffReadyCount').textContent = ffReadyCount;
            document.getElementById('mlReadyCount').textContent = mlReadyCount;
            document.getElementById('totalCount').textContent = currentAccounts.length;
            document.getElementById('activeCount').textContent = activeAccounts.length;
            document.getElementById('soldCount').textContent = soldAccounts.length;
            document.getElementById('cicilanCount').textContent = cicilanAccounts.length || 0;

            // Calculate financial stats
            const totalModal = currentAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0);
            const totalTerjual = soldAccounts.reduce((sum, a) => sum + (a.sellPrice || 0), 0);
            const totalProfit = soldAccounts.reduce((sum, a) => sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);
            const potensiPendapatan = activeAccounts.reduce((sum, a) => sum + (a.targetPrice || 0), 0);

            document.getElementById('totalModal').textContent = formatRupiah(totalModal);
            document.getElementById('totalPenjualan').textContent = formatRupiah(totalTerjual);
            
            const profitEl = document.getElementById('totalProfit');
            profitEl.textContent = (totalProfit >= 0 ? '+' : '') + formatRupiah(totalProfit);
            profitEl.style.color = 'white';
            
            document.getElementById('potensiPendapatan').textContent = formatRupiah(potensiPendapatan);

            // Stats per Game table
            const ffSold = ffAccounts.filter(a => a.status === 'terjual');
            const mlSold = mlAccounts.filter(a => a.status === 'terjual');
            const ffProfit = ffSold.reduce((sum, a) => sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);
            const mlProfit = mlSold.reduce((sum, a) => sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);

            const statsTable = document.getElementById('statsTable');
            if (statsTable) {
                statsTable.innerHTML = `
                    <tr>
                        <td><span class="badge badge-ff">FF</span> Free Fire</td>
                        <td style="text-align: center;">${ffAccounts.length}</td>
                        <td style="text-align: center; color: #27ae60; font-weight: bold;">${ffAccounts.filter(a => a.status === 'aktif').length}</td>
                        <td style="text-align: center; color: #e74c3c; font-weight: bold;">${ffSold.length}</td>
                        <td style="text-align: center; color: #1abc9c; font-weight: bold;">${ffAccounts.filter(a => a.status === 'cicilan').length}</td>
                        <td style="text-align: right;">${formatRupiah(ffAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0))}</td>
                        <td style="text-align: right;">${formatRupiah(ffSold.reduce((sum, a) => sum + (a.sellPrice || 0), 0))}</td>
                        <td style="text-align: right; color: ${ffProfit >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">${ffProfit >= 0 ? '+' : ''}${formatRupiah(ffProfit)}</td>
                    </tr>
                    <tr>
                        <td><span class="badge badge-ml">ML</span> Mobile Legends</td>
                        <td style="text-align: center;">${mlAccounts.length}</td>
                        <td style="text-align: center; color: #27ae60; font-weight: bold;">${mlAccounts.filter(a => a.status === 'aktif').length}</td>
                        <td style="text-align: center; color: #e74c3c; font-weight: bold;">${mlSold.length}</td>
                        <td style="text-align: center; color: #1abc9c; font-weight: bold;">${mlAccounts.filter(a => a.status === 'cicilan').length}</td>
                        <td style="text-align: right;">${formatRupiah(mlAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0))}</td>
                        <td style="text-align: right;">${formatRupiah(mlSold.reduce((sum, a) => sum + (a.sellPrice || 0), 0))}</td>
                        <td style="text-align: right; color: ${mlProfit >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">${mlProfit >= 0 ? '+' : ''}${formatRupiah(mlProfit)}</td>
                    </tr>
                    <tr style="background: linear-gradient(145deg, rgba(4,44,83,0.8), rgba(12,68,124,0.6)); color:var(--gray-800); font-weight: bold;">
                        <td>TOTAL</td>
                        <td style="text-align: center;">${currentAccounts.length}</td>
                        <td style="text-align: center;">${activeAccounts.length}</td>
                        <td style="text-align: center;">${soldAccounts.length}</td>
                        <td style="text-align: center;">${cicilanAccounts.length}</td>
                        <td style="text-align: right;">${formatRupiah(totalModal)}</td>
                        <td style="text-align: right;">${formatRupiah(totalTerjual)}</td>
                        <td style="text-align: right; color: ${totalProfit >= 0 ? '#2ecc71' : '#e74c3c'};">${totalProfit >= 0 ? '+' : ''}${formatRupiah(totalProfit)}</td>
                    </tr>
                `;
            }

            // Seller stats table
            const sellerStatsTable = document.getElementById('sellerStatsTable');
            if (sellerStatsTable) {
                const sellerStats = {};
                currentAccounts.forEach(a => {
                    if (a.seller && a.seller !== '-' && a.seller !== '') {
                        if (!sellerStats[a.seller]) sellerStats[a.seller] = { count: 0, modal: 0, terjual: 0, profit: 0 };
                        sellerStats[a.seller].count++;
                        sellerStats[a.seller].modal += (a.buyPrice || 0);
                        if (a.status === 'terjual') {
                            sellerStats[a.seller].terjual += (a.sellPrice || 0);
                            sellerStats[a.seller].profit += ((a.sellPrice || 0) - (a.buyPrice || 0));
                        }
                    }
                });

                const sellerEntries = Object.entries(sellerStats).sort((a, b) => b[1].count - a[1].count);
                if (sellerEntries.length === 0) {
                    sellerStatsTable.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #5B9ED8;">Belum ada data penjual</td></tr>`;
                } else {
                    sellerStatsTable.innerHTML = sellerEntries.map(([name, data]) => `
                        <tr>
                            <td><strong>${name}</strong></td>
                            <td style="text-align: center;">${data.count}</td>
                            <td style="text-align: right;">${formatRupiah(data.modal)}</td>
                            <td style="text-align: right;">${formatRupiah(data.terjual)}</td>
                            <td style="text-align: right; color: ${data.profit >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">${data.profit >= 0 ? '+' : ''}${formatRupiah(data.profit)}</td>
                        </tr>
                    `).join('');
                }
            }

            // Buyer stats table
            const buyerStatsTable = document.getElementById('buyerStatsTable');
            if (buyerStatsTable) {
                const buyerStats = {};
                accounts.forEach(a => {
                    // Count buyers from sold and cicilan accounts
                    if (a.buyer && a.buyer !== '-' && a.buyer !== '' && (a.status === 'terjual' || a.status === 'cicilan')) {
                        if (!buyerStats[a.buyer]) {
                            buyerStats[a.buyer] = { count: 0, cash: 0, cicilan: 0, total: 0 };
                        }
                        buyerStats[a.buyer].count++;
                        buyerStats[a.buyer].total += (a.sellPrice || 0);
                        
                        if (a.status === 'cicilan') {
                            buyerStats[a.buyer].cicilan++;
                        } else {
                            buyerStats[a.buyer].cash++;
                        }
                    }
                });

                const buyerEntries = Object.entries(buyerStats).sort((a, b) => b[1].total - a[1].total);
                if (buyerEntries.length === 0) {
                    buyerStatsTable.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #5B9ED8;">Belum ada data pembeli</td></tr>`;
                } else {
                    buyerStatsTable.innerHTML = buyerEntries.map(([name, data]) => `
                        <tr>
                            <td><strong>${name}</strong></td>
                            <td style="text-align: center;">${data.count}</td>
                            <td style="text-align: center; color: #27ae60; font-weight: bold;">${data.cash}</td>
                            <td style="text-align: center; color: #1abc9c; font-weight: bold;">${data.cicilan}</td>
                            <td style="text-align: right; font-weight: bold;">${formatRupiah(data.total)}</td>
                        </tr>
                    `).join('');
                }
            }

            // Update stock summary
            updateStockSummary();
        }

        // Update calendar (Jan 2026 - Dec 2027)
        function updateCalendar() {
            const calendarBody = document.getElementById('calendarBody');
            if (!calendarBody) return; // Safety check

            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            let html = '';

            // Start from January 2026 to December 2027
            for (let year = 2026; year <= 2027; year++) {
                const startMonth = 0; // January = 0
                const endMonth = 11; // December = 11

                for (let month = startMonth; month <= endMonth; month++) {
                    // Get accounts bought in this month
                    const monthAccounts = accounts.filter(a => {
                        if (a.buyDate) {
                            const parts = a.buyDate.split('-');
                            const accYear = parseInt(parts[0]);
                            const accMonth = parseInt(parts[1]) - 1;
                            return accMonth === month && accYear === year;
                        }
                        return false;
                    });

                    const ffAccounts = monthAccounts.filter(a => a.game === 'ff');
                    const mlAccounts = monthAccounts.filter(a => a.game === 'ml');

                    const ffReady = ffAccounts.filter(a => a.status === 'aktif').length;
                    const ffSold = ffAccounts.filter(a => a.status === 'terjual').length;
                    const ffCicilan = ffAccounts.filter(a => a.status === 'cicilan').length;

                    const mlReady = mlAccounts.filter(a => a.status === 'aktif').length;
                    const mlSold = mlAccounts.filter(a => a.status === 'terjual').length;
                    const mlCicilan = mlAccounts.filter(a => a.status === 'cicilan').length;

                    // Calculate revenue from sales in this month (by sellDate)
                    const monthSales = accounts.filter(a => {
                        if (a.sellDate && a.status === 'terjual') {
                            const parts = a.sellDate.split('-');
                            const saleYear = parseInt(parts[0]);
                            const saleMonth = parseInt(parts[1]) - 1;
                            return saleMonth === month && saleYear === year;
                        }
                        return false;
                    });
                    const totalRevenue = monthSales.reduce((sum, a) => sum + (a.sellPrice || 0), 0);

                    const hasData = ffAccounts.length > 0 || mlAccounts.length > 0 || totalRevenue > 0;

                    html += `
                        <tr style="${hasData ? '' : 'opacity: 0.5;'}">
                            <td><strong>${monthNames[month]} ${year}</strong></td>
                            <td style="text-align: center; ${ffReady > 0 ? 'color: #27ae60; font-weight: bold;' : ''}">${ffReady}</td>
                            <td style="text-align: center; ${ffSold > 0 ? 'color: #e74c3c; font-weight: bold;' : ''}">${ffSold}</td>
                            <td style="text-align: center; ${ffCicilan > 0 ? 'color: #1abc9c; font-weight: bold;' : ''}">${ffCicilan}</td>
                            <td style="text-align: center; ${mlReady > 0 ? 'color: #27ae60; font-weight: bold;' : ''}">${mlReady}</td>
                            <td style="text-align: center; ${mlSold > 0 ? 'color: #e74c3c; font-weight: bold;' : ''}">${mlSold}</td>
                            <td style="text-align: center; ${mlCicilan > 0 ? 'color: #1abc9c; font-weight: bold;' : ''}">${mlCicilan}</td>
                            <td style="text-align: right; ${totalRevenue > 0 ? 'color: #27ae60; font-weight: bold;' : ''}">${totalRevenue > 0 ? formatRupiah(totalRevenue) : '-'}</td>
                            <td style="text-align: center;">
                                <button class="btn btn-primary" onclick="selectMonthForStock(${year}, ${month})" style="padding: 5px 10px; font-size: 0.8rem;">➕ Isi Stok</button>
                            </td>
                        </tr>
                    `;
                }
            }

            document.getElementById('calendarBody').innerHTML = html;
        }

        // Update stock summary
        function updateStockSummary() {
            const ffAccounts = accounts.filter(a => a.game === 'ff');
            const mlAccounts = accounts.filter(a => a.game === 'ml');

            // Get global month filters
            const globalSelMonth = document.getElementById('globalFilterMonth').value;
            const globalSelYear = document.getElementById('globalFilterYear').value;
            const globalMonthFilter = globalSelMonth === 'all' ? 'all' : `${globalSelYear}-${globalSelMonth}`;

            // Filter FF accounts by month
            let filteredFFAccounts = ffAccounts;
            if (globalMonthFilter && globalMonthFilter !== 'all') {
                const [year, month] = globalMonthFilter.split('-').map(Number);
                filteredFFAccounts = ffAccounts.filter(a => {
                    if (a.buyDate) {
                        const parts = a.buyDate.split('-');
                        const accYear = parseInt(parts[0]);
                        const accMonth = parseInt(parts[1]) - 1;
                        return accYear === year && accMonth === month;
                    }
                    return false;
                });
                
                // Update filter info
                const filterInfo = document.getElementById('ffMonthFilterInfo');
                if (filterInfo) {
                    filterInfo.textContent = `Menampilkan ${monthNames[month]} ${year} (${filteredFFAccounts.length} akun)`;
                }
            } else {
                const filterInfo = document.getElementById('ffMonthFilterInfo');
                if (filterInfo) {
                    filterInfo.textContent = `Menampilkan semua bulan (${filteredFFAccounts.length} akun)`;
                }
            }

            // Filter ML accounts by month
            let filteredMLAccounts = mlAccounts;
            if (globalMonthFilter && globalMonthFilter !== 'all') {
                const [year, month] = globalMonthFilter.split('-').map(Number);
                filteredMLAccounts = mlAccounts.filter(a => {
                    if (a.buyDate) {
                        const parts = a.buyDate.split('-');
                        const accYear = parseInt(parts[0]);
                        const accMonth = parseInt(parts[1]) - 1;
                        return accYear === year && accMonth === month;
                    }
                    return false;
                });
                
                // Update filter info
                const filterInfo = document.getElementById('mlMonthFilterInfo');
                if (filterInfo) {
                    filterInfo.textContent = `Menampilkan ${monthNames[month]} ${year} (${filteredMLAccounts.length} akun)`;
                }
            } else {
                const filterInfo = document.getElementById('mlMonthFilterInfo');
                if (filterInfo) {
                    filterInfo.textContent = `Menampilkan semua bulan (${filteredMLAccounts.length} akun)`;
                }
            }

            const ffTotal = filteredFFAccounts.length;
            const ffReady = filteredFFAccounts.filter(a => a.status === 'aktif').length;
            const ffSold = filteredFFAccounts.filter(a => a.status === 'terjual').length;
            const ffCicilan = filteredFFAccounts.filter(a => a.status === 'cicilan').length;

            const mlTotal = filteredMLAccounts.length;
            const mlReady = filteredMLAccounts.filter(a => a.status === 'aktif').length;
            const mlSold = filteredMLAccounts.filter(a => a.status === 'terjual').length;
            const mlCicilan = filteredMLAccounts.filter(a => a.status === 'cicilan').length;

            // Update Cards with safety checks
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setVal('ffTotalStock', ffTotal);
            setVal('ffReady', ffReady);
            setVal('ffSoldStock', ffSold);
            setVal('ffCicilan', ffCicilan);
            setVal('mlTotalStock', mlTotal);
            setVal('mlReady', mlReady);
            setVal('mlSoldStock', mlSold);
            setVal('mlCicilan', mlCicilan);

            // FF Ready Table
            const ffReadyTable = document.getElementById('ffReadyTable');
            if (ffReadyTable) {
                const ffReadyAccounts = filteredFFAccounts.filter(a => a.status === 'aktif');
                if (ffReadyAccounts.length === 0) {
                    ffReadyTable.innerHTML = `<tr><td colspan="14"><div class="empty-state"><p>Belum ada stok FF ready${ffMonthFilter !== 'all' ? ' untuk bulan ini' : ''}</p></div></td></tr>`;
                } else {
                    ffReadyTable.innerHTML = ffReadyAccounts.map((a, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${a.spek || '-'}</td>
                            <td>${a.rank || '-'}</td>
                            <td>${formatRupiah(a.buyPrice)}</td>
                            <td>${formatRupiah(a.sellPrice || 0)}</td>
                            <td>${formatRupiah(a.targetPrice || 0)}</td>
                            <td>${a.seller || '-'}</td>
                            <td>${a.buyer || '-'}</td>
                            <td>${a.email || '-'}</td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">${a.keterangan || '-'}</span></td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">📱 ${a.device || '-'}</span></td>
                            <td>${a.buyDate || '-'}</td>
                            <td style="white-space: nowrap;">
                                <button class="btn btn-primary" onclick="openEditModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Edit">✏️</button>
                                <button class="btn btn-success" onclick="openSellModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Jual">💰</button>
                                <button class="btn btn-warning" onclick="markAsCicilan('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Cicilan">💳</button>
                                <button class="btn" onclick="openMoveMonthModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color:var(--gray-800);" title="Pindahkan ke Bulan">📅</button>
                                <button class="btn btn-danger" onclick="deleteAccount('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem;" title="Hapus">🗑️</button>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            // FF Sold Table
            const ffSoldTable = document.getElementById('ffSoldTable');
            if (ffSoldTable) {
                const ffSoldAccounts = filteredFFAccounts.filter(a => a.status === 'terjual');
                if (ffSoldAccounts.length === 0) {
                    ffSoldTable.innerHTML = `<tr><td colspan="14"><div class="empty-state"><p>Belum ada stok FF terjual${ffMonthFilter !== 'all' ? ' untuk bulan ini' : ''}</p></div></td></tr>`;
                } else {
                    ffSoldTable.innerHTML = ffSoldAccounts.map((a, i) => {
                        const profit = (a.sellPrice || 0) - (a.buyPrice || 0);
                        return `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${a.spek || '-'}</td>
                                <td>${a.rank || '-'}</td>
                                <td>${formatRupiah(a.buyPrice)}</td>
                                <td>${formatRupiah(a.sellPrice || 0)}</td>
                                <td>${formatRupiah(a.targetPrice || 0)}</td>
                                <td>${a.seller || '-'}</td>
                                <td>${a.buyer || '-'}</td>
                                <td>${a.email || '-'}</td>
                                <td class="${profit >= 0 ? 'cashflow-positive' : 'cashflow-negative'}">${formatRupiah(profit)}</td>
                                <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">${a.keterangan || '-'}</span></td>
                                <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">📱 ${a.device || '-'}</span></td>
                                <td>${a.sellDate || '-'}</td>
                                <td style="white-space: nowrap;">
                                    <button class="btn btn-primary btn-icon" onclick="openEditModal('${a.id}')" style="padding: 5px 8px; font-size: 0.8rem; margin-right: 3px;" title="Edit">✏️</button>
                                    <button class="btn btn-warning btn-icon" onclick="openEditSellPriceModal('${a.id}')" title="Edit Harga Jual" style="padding: 5px 8px; font-size: 0.8rem; margin-right: 3px;">💰</button>
                                    <button class="btn btn-icon btn-delete" onclick="deleteAccount('${a.id}')" style="padding: 5px 8px; font-size: 0.8rem;" title="Hapus">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }

            // FF Cicilan Table
            const ffCicilanTable = document.getElementById('ffCicilanTable');
            if (ffCicilanTable) {
                const ffCicilanAccounts = filteredFFAccounts.filter(a => a.status === 'cicilan');
                if (ffCicilanAccounts.length === 0) {
                    ffCicilanTable.innerHTML = `<tr><td colspan="16"><div class="empty-state"><p>Belum ada stok FF cicilan${ffMonthFilter !== 'all' ? ' untuk bulan ini' : ''}</p></div></td></tr>`;
                } else {
                    ffCicilanTable.innerHTML = ffCicilanAccounts.map((a, i) => {
                        const totalAmount = a.targetPrice || a.sellPrice || a.buyPrice || 0;
                        const paidAmount = a.installmentPaid || 0;
                        const remainingAmount = totalAmount - paidAmount;
                        return `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${a.spek || '-'}</td>
                            <td>${a.rank || '-'}</td>
                            <td>${formatRupiah(a.buyPrice)}</td>
                            <td style="color: #27ae60; font-weight: bold;">${formatRupiah(paidAmount)}</td>
                            <td style="color: #9b59b6; font-weight: bold;">${formatRupiah(totalAmount)}</td>
                            <td style="color: #3498db; font-weight: bold;">${formatRupiah(totalAmount)}</td>
                            <td style="color: ${remainingAmount > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">${formatRupiah(remainingAmount)}</td>
                            <td>${a.seller || '-'}</td>
                            <td>${a.buyer || '-'}</td>
                            <td>${a.email || '-'}</td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">${a.keterangan || '-'}</span></td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">📱 ${a.device || '-'}</span></td>
                            <td>${a.buyDate || '-'}</td>
                            <td style="white-space: nowrap;">
                                <button class="btn btn-icon btn-edit-cicilan" onclick="openEditInstallmentModal('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Edit Cicilan">✏️</button>
                                <button class="btn btn-icon btn-pay" onclick="openInstallmentModal('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Bayar Cicilan">💵</button>
                                <button class="btn btn-icon btn-edit" onclick="openEditModal('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Edit Akun">✏️</button>
                                <button class="btn btn-icon btn-lunas" onclick="markAsPaid('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Tandai Lunas">✅</button>
                                <button class="btn btn-icon btn-delete" onclick="deleteAccount('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem;" title="Hapus">🗑️</button>
                            </td>
                        </tr>
                        `;
                    }).join('');
                }
            }

            // ML Ready Table
            const mlReadyTable = document.getElementById('mlReadyTable');
            if (mlReadyTable) {
                const mlReadyAccounts = filteredMLAccounts.filter(a => a.status === 'aktif');
                if (mlReadyAccounts.length === 0) {
                    mlReadyTable.innerHTML = `<tr><td colspan="14"><div class="empty-state"><p>Belum ada stok ML ready${mlMonthFilter !== 'all' ? ' untuk bulan ini' : ''}</p></div></td></tr>`;
                } else {
                    mlReadyTable.innerHTML = mlReadyAccounts.map((a, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${a.spek || '-'}</td>
                            <td>${a.rank || '-'}</td>
                            <td>${formatRupiah(a.buyPrice)}</td>
                            <td>${formatRupiah(a.sellPrice || 0)}</td>
                            <td>${formatRupiah(a.targetPrice || 0)}</td>
                            <td>${a.seller || '-'}</td>
                            <td>${a.buyer || '-'}</td>
                            <td>${a.email || '-'}</td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">${a.keterangan || '-'}</span></td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">📱 ${a.device || '-'}</span></td>
                            <td>${a.buyDate || '-'}</td>
                            <td style="white-space: nowrap;">
                                <button class="btn btn-primary" onclick="openEditModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Edit">✏️</button>
                                <button class="btn btn-success" onclick="openSellModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Jual">💰</button>
                                <button class="btn btn-warning" onclick="markAsCicilan('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Cicilan">💳</button>
                                <button class="btn" onclick="openMoveMonthModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color:var(--gray-800);" title="Pindahkan ke Bulan">📅</button>
                                <button class="btn btn-danger" onclick="deleteAccount('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem;" title="Hapus">🗑️</button>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            // ML Sold Table
            const mlSoldTable = document.getElementById('mlSoldTable');
            if (mlSoldTable) {
                const mlSoldAccounts = filteredMLAccounts.filter(a => a.status === 'terjual');
                if (mlSoldAccounts.length === 0) {
                    mlSoldTable.innerHTML = `<tr><td colspan="14"><div class="empty-state"><p>Belum ada stok ML terjual${mlMonthFilter !== 'all' ? ' untuk bulan ini' : ''}</p></div></td></tr>`;
                } else {
                    mlSoldTable.innerHTML = mlSoldAccounts.map((a, i) => {
                        const profit = (a.sellPrice || 0) - (a.buyPrice || 0);
                        return `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${a.spek || '-'}</td>
                                <td>${a.rank || '-'}</td>
                                <td>${formatRupiah(a.buyPrice)}</td>
                                <td>${formatRupiah(a.sellPrice || 0)}</td>
                                <td>${formatRupiah(a.targetPrice || 0)}</td>
                                <td>${a.seller || '-'}</td>
                                <td>${a.buyer || '-'}</td>
                                <td>${a.email || '-'}</td>
                                <td class="${profit >= 0 ? 'cashflow-positive' : 'cashflow-negative'}">${formatRupiah(profit)}</td>
                                <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">${a.keterangan || '-'}</span></td>
                                <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">📱 ${a.device || '-'}</span></td>
                                <td>${a.sellDate || '-'}</td>
                                <td style="white-space: nowrap;">
                                    <button class="btn btn-primary btn-icon" onclick="openEditModal('${a.id}')" style="padding: 5px 8px; font-size: 0.8rem; margin-right: 3px;" title="Edit">✏️</button>
                                    <button class="btn btn-warning btn-icon" onclick="openEditSellPriceModal('${a.id}')" title="Edit Harga Jual" style="padding: 5px 8px; font-size: 0.8rem; margin-right: 3px;">💰</button>
                                    <button class="btn btn-icon btn-delete" onclick="deleteAccount('${a.id}')" style="padding: 5px 8px; font-size: 0.8rem;" title="Hapus">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }

            // ML Cicilan Table
            const mlCicilanTable = document.getElementById('mlCicilanTable');
            if (mlCicilanTable) {
                const mlCicilanAccounts = filteredMLAccounts.filter(a => a.status === 'cicilan');
                if (mlCicilanAccounts.length === 0) {
                    mlCicilanTable.innerHTML = `<tr><td colspan="16"><div class="empty-state"><p>Belum ada stok ML cicilan${mlMonthFilter !== 'all' ? ' untuk bulan ini' : ''}</p></div></td></tr>`;
                } else {
                    mlCicilanTable.innerHTML = mlCicilanAccounts.map((a, i) => {
                        const totalAmount = a.targetPrice || a.sellPrice || a.buyPrice || 0;
                        const paidAmount = a.installmentPaid || 0;
                        const remainingAmount = totalAmount - paidAmount;
                        return `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${a.spek || '-'}</td>
                            <td>${a.rank || '-'}</td>
                            <td>${formatRupiah(a.buyPrice)}</td>
                            <td style="color: #27ae60; font-weight: bold;">${formatRupiah(paidAmount)}</td>
                            <td style="color: #9b59b6; font-weight: bold;">${formatRupiah(totalAmount)}</td>
                            <td style="color: #3498db; font-weight: bold;">${formatRupiah(totalAmount)}</td>
                            <td style="color: ${remainingAmount > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">${formatRupiah(remainingAmount)}</td>
                            <td>${a.seller || '-'}</td>
                            <td>${a.buyer || '-'}</td>
                            <td>${a.email || '-'}</td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">${a.keterangan || '-'}</span></td>
                            <td><span style="font-size: 0.85rem; color:var(--navy); font-weight: bold;">📱 ${a.device || '-'}</span></td>
                            <td>${a.buyDate || '-'}</td>
                            <td style="white-space: nowrap;">
                                <button class="btn btn-icon btn-edit-cicilan" onclick="openEditInstallmentModal('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Edit Cicilan">✏️</button>
                                <button class="btn btn-icon btn-pay" onclick="openInstallmentModal('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Bayar Cicilan">💵</button>
                                <button class="btn btn-icon btn-edit" onclick="openEditModal('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Edit Akun">✏️</button>
                                <button class="btn btn-icon btn-lunas" onclick="markAsPaid('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem; margin-right: 2px;" title="Tandai Lunas">✅</button>
                                <button class="btn btn-icon btn-delete" onclick="deleteAccount('${a.id}')" style="padding: 4px 6px; font-size: 0.75rem;" title="Hapus">🗑️</button>
                            </td>
                        </tr>
                        `;
                    }).join('');
                }
            }
        }

        // Filter by level
        function filterByLevel(game, level) {
            // Switch to pencarian tab
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById('pencarian').classList.add('active');
            document.querySelectorAll('.nav-tab')[3].classList.add('active');

            // Set filter
            document.getElementById('searchResellerGame').value = game;
            document.getElementById('searchResellerStatus').value = 'aktif';
            document.getElementById('searchResellerKeyword').value = level;

            // Apply search
            searchResellerAccounts();
        }

        // Render accounts table
        function renderAccounts(filteredAccounts = null) {
            const tbody = document.getElementById('accountTable');
            if (!tbody) return; // Safety check: Exit if table doesn't exist

            const data = filteredAccounts || accounts;

            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8">
                            <div class="empty-state">
                                <p>Belum ada akun. Tambahkan akun pertama Anda!</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.map((a, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><span class="badge badge-${a.game}">${a.game === 'ff' ? 'FF' : 'ML'}</span></td>
                    <td><strong>${a.accountId}</strong></td>
                    <td>${a.level}</td>
                    <td>${formatRupiah(a.price)}</td>
                    <td><span class="badge badge-${a.status}">${a.status === 'aktif' ? '✅ Aktif' : a.status === 'terjual' ? '❌ Terjual' : '💳 Cicilan'}</span></td>
                    <td>${formatDate(a.dateIn)}</td>
                    <td>
                        ${a.status === 'aktif' ? `
                            <button class="btn btn-success" onclick="openSellModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">💰 Jual</button>
                        ` : ''}
                        ${a.status === 'cicilan' ? `
                            <button class="btn btn-success" onclick="markAsPaid('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">✅ Lunas</button>
                        ` : ''}
                        <button class="btn btn-primary" onclick="openEditModal('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">✏️</button>
                        <button class="btn btn-danger" onclick="deleteAccount('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem;">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }

        // Render sales table
        function renderSales() {
            const tbody = document.getElementById('salesTable');
            if (!tbody) return; // Safety check

            if (sales.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7">
                            <div class="empty-state">
                                <p>Belum ada riwayat penjualan</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            const sortedSales = [...sales].sort((a, b) => new Date(b.saleDate || b.dateIn) - new Date(a.saleDate || a.dateIn));

            tbody.innerHTML = sortedSales.map((s, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(s.saleDate || s.dateIn)}</td>
                    <td><span class="badge badge-${s.game}">${s.game === 'ff' ? 'FF' : 'ML'}</span></td>
                    <td>${s.accountIdDisplay || s.spek || s.accountId}</td>
                    <td>${formatRupiah(s.price || s.sellPrice)}</td>
                    <td>${s.buyerName || s.buyer || '-'}</td>
                    <td>
                        <span class="badge ${s.paymentType === 'cicilan' ? 'badge-cicilan' : 'badge-aktif'}">
                            ${s.paymentType === 'cicilan' ? `💳 Cicilan (${s.installmentCount || 1}x)` : '✅ Cash'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteSale('${s.id}')">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }

        // Filter accounts
        function filterAccounts() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const gameFilter = document.getElementById('filterGame').value;
            const statusFilter = document.getElementById('filterStatus').value;

            const filtered = accounts.filter(a => {
                const matchSearch = a.accountId.toLowerCase().includes(search) || 
                                   a.level.toLowerCase().includes(search);
                const matchGame = gameFilter === 'all' || a.game === gameFilter;
                const matchStatus = statusFilter === 'all' || a.status === statusFilter;

                return matchSearch && matchGame && matchStatus;
            });

            renderAccounts(filtered);
        }

        // Save FF Account - Direct function without form validation
        function saveFFAccount() {
            console.log('saveFFAccount called');

            try {
                const spek = document.getElementById('ffSpek').value.trim();
                const rank = document.getElementById('ffLevel').value.trim();
                const buyPrice = parseRupiah(document.getElementById('ffBuyPrice').value);
                const targetPrice = parseRupiah(document.getElementById('ffTargetPrice').value);
                const buyMonth = document.getElementById('ffBuyMonth').value;
                const buyDate = document.getElementById('ffBuyDate').value;
                const seller = document.getElementById('ffSeller').value.trim();
                const buyer = document.getElementById('ffBuyer').value.trim();
                const email = document.getElementById('ffEmail').value.trim();
                const notes = document.getElementById('ffNotes').value.trim();
                const keterangan = getKeteranganValue('ff');
                const device = document.getElementById('ffDevice').value.trim();

                if (!buyMonth) {
                    alert('⚠️ Pilih bulan masuk stok terlebih dahulu!');
                    return;
                }

                const [year, month] = buyMonth.split('-').map(Number);
                const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

                // Use buyDate from date input if provided, otherwise set to last day of selected month
                let finalBuyDate = buyDate;
                if (!finalBuyDate) {
                    const day = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');
                    finalBuyDate = `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
                }

                // Create account object
                const account = {
                    id: generateId(),
                    game: 'ff',
                    spek: spek || 'Tidak ada spesifikasi',
                    rank: rank || '-',
                    buyPrice: buyPrice || 0,
                    targetPrice: targetPrice || 0,
                    buyDate: finalBuyDate,
                    sellDate: '',
                    sellPrice: 0,
                    seller: seller || '-',
                    buyer: buyer || '',
                    email: email || '-',
                    notes: notes || '-',
                    keterangan: keterangan || '-',
                    device: device || '-',
                    status: buyer ? 'terjual' : 'aktif'
                };

                console.log('Account to save:', account);

                // Add to accounts array
                accounts.push(account);
                console.log('Accounts count:', accounts.length);

                // Save to localStorage
                saveData();

                // Clear form
                document.getElementById('ffSpek').value = '';
                document.getElementById('ffLevel').value = '';
                document.getElementById('ffBuyPrice').value = '';
                document.getElementById('ffTargetPrice').value = '';
                document.getElementById('ffBuyMonth').value = '';
                document.getElementById('ffBuyDate').value = '';
                document.getElementById('ffSeller').value = '';
                document.getElementById('ffBuyer').value = '';
                document.getElementById('ffEmail').value = '';
                document.getElementById('ffNotes').value = '';
                document.getElementById('ffKeterangan').value = '';
                document.getElementById('ffKeteranganCustom').value = '';
                document.getElementById('ffKeteranganCustom').style.display = 'none';
                document.getElementById('ffDevice').value = '';

                // Refresh display
                renderAccounts();
                updateDashboard();
                updateStockSummary();

                // Show success message
                alert('✅ Akun FF berhasil disimpan ke ' + monthNames[month] + ' ' + year + '!\n\n' +
                      'Spesifikasi: ' + account.spek + '\n' +
                      'Harga Beli: ' + formatRupiah(account.buyPrice) + '\n' +
                      'Bulan: ' + monthNames[month] + ' ' + year + '\n' +
                      'Total Akun: ' + accounts.length);

            } catch (error) {
                console.error('Error saving FF account:', error);
                alert('❌ Error: ' + error.message);
            }
        }

        // Save ML Account - Direct function without form validation
        function saveMLAccount() {
            console.log('saveMLAccount called');

            try {
                const spek = document.getElementById('mlSpek').value.trim();
                const rank = document.getElementById('mlLevel').value.trim();
                const buyPrice = parseRupiah(document.getElementById('mlBuyPrice').value);
                const targetPrice = parseRupiah(document.getElementById('mlTargetPrice').value);
                const buyMonth = document.getElementById('mlBuyMonth').value;
                const buyDate = document.getElementById('mlBuyDate').value;
                const seller = document.getElementById('mlSeller').value.trim();
                const buyer = document.getElementById('mlBuyer').value.trim();
                const email = document.getElementById('mlEmail').value.trim();
                const notes = document.getElementById('mlNotes').value.trim();
                const keterangan = getKeteranganValue('ml');
                const device = document.getElementById('mlDevice').value.trim();

                if (!buyMonth) {
                    alert('⚠️ Pilih bulan masuk stok terlebih dahulu!');
                    return;
                }

                const [year, month] = buyMonth.split('-').map(Number);
                const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

                // Use buyDate from date input if provided, otherwise set to last day of selected month
                let finalBuyDate = buyDate;
                if (!finalBuyDate) {
                    const day = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');
                    finalBuyDate = `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
                }

                // Create account object
                const account = {
                    id: generateId(),
                    game: 'ml',
                    spek: spek || 'Tidak ada spesifikasi',
                    rank: rank || '-',
                    buyPrice: buyPrice || 0,
                    targetPrice: targetPrice || 0,
                    buyDate: finalBuyDate,
                    sellDate: '',
                    sellPrice: 0,
                    seller: seller || '-',
                    buyer: buyer || '',
                    email: email || '-',
                    notes: notes || '-',
                    keterangan: keterangan || '-',
                    device: device || '-',
                    status: buyer ? 'terjual' : 'aktif'
                };

                console.log('Account to save:', account);

                // Add to accounts array
                accounts.push(account);
                console.log('Accounts count:', accounts.length);

                // Save to localStorage
                saveData();

                // Clear form
                document.getElementById('mlSpek').value = '';
                document.getElementById('mlLevel').value = '';
                document.getElementById('mlBuyPrice').value = '';
                document.getElementById('mlTargetPrice').value = '';
                document.getElementById('mlBuyMonth').value = '';
                document.getElementById('mlBuyDate').value = '';
                document.getElementById('mlSeller').value = '';
                document.getElementById('mlBuyer').value = '';
                document.getElementById('mlEmail').value = '';
                document.getElementById('mlNotes').value = '';
                document.getElementById('mlKeterangan').value = '';
                document.getElementById('mlKeteranganCustom').value = '';
                document.getElementById('mlKeteranganCustom').style.display = 'none';
                document.getElementById('mlDevice').value = '';

                // Refresh display
                renderAccounts();
                updateDashboard();
                updateStockSummary();

                // Show success message
                alert('✅ Akun ML berhasil disimpan ke ' + monthNames[month] + ' ' + year + '!\n\n' +
                      'Spesifikasi: ' + account.spek + '\n' +
                      'Harga Beli: ' + formatRupiah(account.buyPrice) + '\n' +
                      'Bulan: ' + monthNames[month] + ' ' + year + '\n' +
                      'Total Akun: ' + accounts.length);

            } catch (error) {
                console.error('Error saving ML account:', error);
                alert('❌ Error: ' + error.message);
            }
        }

        // Edit account
        function openEditModal(id) {
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            document.getElementById('editId').value = account.id;
            document.getElementById('editGame').value = account.game;
            document.getElementById('editAccountId').value = account.spek || account.accountId || '';
            document.getElementById('editLevel').value = account.rank || account.level || '';
            document.getElementById('editPrice').value = account.buyPrice ? 'Rp ' + new Intl.NumberFormat('id-ID').format(account.buyPrice) : '';
            document.getElementById('editTargetPrice').value = account.targetPrice ? 'Rp ' + new Intl.NumberFormat('id-ID').format(account.targetPrice) : '';
            document.getElementById('editPassword').value = account.password || '';
            document.getElementById('editEmail').value = account.email || '';
            document.getElementById('editBuyDate').value = account.buyDate || '';
            document.getElementById('editStatus').value = account.status;

            // Set keterangan
            const keteranganSelect = document.getElementById('editKeterangan');
            const keteranganCustom = document.getElementById('editKeteranganCustom');
            const keteranganValue = account.keterangan || '';
            const predefinedOptions = ['', 'Akun Pribadi', 'Akun Titipan', 'Akun Baru', 'Akun Bekas', 'Akun Sultan', 'Akun Receh', '-'];
            if (predefinedOptions.includes(keteranganValue) || keteranganValue === '-') {
                keteranganSelect.value = keteranganValue === '-' ? '' : keteranganValue;
                keteranganCustom.style.display = 'none';
                keteranganCustom.value = '';
            } else {
                keteranganSelect.value = 'custom';
                keteranganCustom.style.display = 'block';
                keteranganCustom.value = keteranganValue;
            }

            // Set device
            document.getElementById('editDevice').value = account.device && account.device !== '-' ? account.device : '';

            document.getElementById('editModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('editModal').classList.remove('show');
        }

        function closeAllModals() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.classList.remove('show');
            });
        }

        // Close modal when clicking outside (on backdrop)
        document.addEventListener('click', function(e) {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                // Check if click is on modal backdrop (not on modal content)
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Move account to different month
        function openMoveMonthModal(id) {
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            document.getElementById('moveMonthAccountId').value = account.id;
            const displayName = account.spek || account.accountId || 'Akun';
            const displayRank = account.rank || account.level || '';
            document.getElementById('moveMonthAccountInfo').value = `${account.game.toUpperCase()} - ${displayName} (${displayRank})`;
            
            // Pre-select current month if available
            if (account.buyDate) {
                const parts = account.buyDate.split('-');
                const year = parts[0];
                const month = parseInt(parts[1]) - 1;
                document.getElementById('moveToMonthSelect').value = `${year}-${month}`;
            }

            document.getElementById('moveMonthModal').classList.add('show');
        }

        function closeMoveMonthModal() {
            document.getElementById('moveMonthModal').classList.remove('show');
        }

        function moveToSelectedMonth() {
            const id = document.getElementById('moveMonthAccountId').value;
            const targetMonth = document.getElementById('moveToMonthSelect').value;
            
            if (!targetMonth) {
                alert('⚠️ Pilih bulan terlebih dahulu!');
                return;
            }

            const account = accounts.find(a => a.id === id);
            if (!account) {
                alert('⚠️ Akun tidak ditemukan!');
                return;
            }

            const [year, month] = targetMonth.split('-').map(Number);
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            
            // Set buyDate to last day of selected month
            const day = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');
            account.buyDate = `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
            
            saveData();
            updateDashboard();
            closeMoveMonthModal();

            alert(`✅ Akun berhasil dipindahkan ke ${monthNames[month]} ${year}!\n\nTanggal Beli: ${account.buyDate}`);
        }

        document.getElementById('editForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('editId').value;
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            account.game = document.getElementById('editGame').value;
            account.spek = document.getElementById('editAccountId').value;
            account.rank = document.getElementById('editLevel').value;
            account.buyPrice = parseRupiah(document.getElementById('editPrice').value);
            account.targetPrice = parseRupiah(document.getElementById('editTargetPrice').value);
            account.password = document.getElementById('editPassword').value;
            account.email = document.getElementById('editEmail').value;
            const newBuyDate = document.getElementById('editBuyDate').value;
            if (newBuyDate) {
                account.buyDate = newBuyDate;
            }
            account.status = document.getElementById('editStatus').value;
            account.keterangan = getKeteranganValue('edit');
            account.device = document.getElementById('editDevice').value.trim() || '-';

            saveData();
            renderAccounts();
            updateDashboard();
            closeModal();

            alert('✅ Akun berhasil diupdate!');
        });

        // Mark cicilan as paid (Pindah ke Terjual)
        function markAsPaid(id) {
            if (!confirm('Tandai akun ini sebagai LUNAS dan pindahkan ke Stok Terjual?')) return;

            const account = accounts.find(a => a.id === id);
            if (account) {
                // Jika belum ada harga jual, anggap sama dengan target jual atau harga beli (sebagai fallback)
                if (!account.sellPrice || account.sellPrice === 0) {
                    account.sellPrice = account.targetPrice || account.buyPrice;
                }

                // Tandai tanggal lunas jika belum ada
                if (!account.sellDate) {
                    account.sellDate = new Date().toISOString().split('T')[0];
                }

                account.status = 'terjual';
                saveData();
                updateDashboard();
                renderKalenderKeuangan(); // Update kalender keuangan dengan keuntungan otomatis
                renderAkunMasukHarian(); // Update akun masuk harian
                // Jika sedang di tab cicilan, refresh agar hilang dari sini
                updateStockSummary();
            }
        }

        // Mark as Cicilan
        function markAsCicilan(id) {
            if (!confirm('Tandai akun ini sebagai Cicilan?')) return;

            const account = accounts.find(a => a.id === id);
            if (account) {
                // Jika status berubah ke cicilan, pastikan ada data harga jual (asumsi dari target jual)
                if (!account.sellPrice || account.sellPrice === 0) {
                    account.sellPrice = account.targetPrice || account.buyPrice;
                }
                // Initialize installment tracking
                account.installmentPaid = 0;
                account.status = 'cicilan';
                saveData();
                updateDashboard();
            }
        }

        // Sell account (Jual Cash / Cicilan via Modal)
        function openSellModal(id) {
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            document.getElementById('sellId').value = account.id;
            // Use spek/rank if accountId/level are not available
            const displayName = account.spek || account.accountId || 'Akun';
            const displayRank = account.rank || account.level || '';
            document.getElementById('sellAccountInfo').value = `${account.game.toUpperCase()} - ${displayName} (${displayRank})`;
            document.getElementById('sellPrice').value = account.targetPrice ? 'Rp ' + new Intl.NumberFormat('id-ID').format(account.targetPrice) : '';
            document.getElementById('sellDate').value = new Date().toISOString().split('T')[0];

            document.getElementById('sellModal').classList.add('show');
        }

        function closeSellModal() {
            document.getElementById('sellModal').classList.remove('show');
        }

        // Open edit sell price modal
        function openEditSellPriceModal(id) {
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            document.getElementById('editSellPriceId').value = account.id;
            const displayName = account.spek || account.accountId || 'Akun';
            const displayRank = account.rank || account.level || '';
            document.getElementById('editSellPriceAccountInfo').value = `${account.game.toUpperCase()} - ${displayName} (${displayRank})`;
            document.getElementById('editNewSellPrice').value = account.sellPrice ? 'Rp ' + new Intl.NumberFormat('id-ID').format(account.sellPrice) : '';
            document.getElementById('editNewSellDate').value = account.sellDate || '';

            document.getElementById('editSellPriceModal').classList.add('show');
        }

        function closeEditSellPriceModal() {
            document.getElementById('editSellPriceModal').classList.remove('show');
        }

        // Handle edit sell price form submit
        document.getElementById('editSellPriceForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('editSellPriceId').value;
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            const newSellPrice = parseRupiah(document.getElementById('editNewSellPrice').value);
            const newSellDate = document.getElementById('editNewSellDate').value;

            if (newSellPrice <= 0) {
                alert('❌ Harga jual harus lebih dari 0!');
                return;
            }

            // Update account with new sell price
            account.sellPrice = newSellPrice;
            if (newSellDate) {
                account.sellDate = newSellDate;
            }

            saveData();
            renderAccounts();
            updateDashboard();
            renderKalenderKeuangan(); // Update kalender keuangan dengan keuntungan otomatis
            renderAkunMasukHarian(); // Update akun masuk harian
            closeEditSellPriceModal();

            alert('✅ Harga jual berhasil diupdate!');
        });

        // Toggle cicilan fields
        function toggleCicilanFields() {
            const paymentType = document.getElementById('paymentType').value;
            const cicilanFields = document.getElementById('cicilanFields');
            
            if (paymentType === 'cicilan') {
                cicilanFields.style.display = 'block';
            } else {
                cicilanFields.style.display = 'none';
            }
        }

        document.getElementById('sellForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('sellId').value;
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            const paymentType = document.getElementById('paymentType').value;
            const sellPrice = parseRupiah(document.getElementById('sellPrice').value);
            const sellDate = document.getElementById('sellDate').value;

            // Update account with sell info
            account.sellPrice = sellPrice;
            account.sellDate = sellDate;
            account.buyer = document.getElementById('buyerName').value || '-';
            account.status = paymentType === 'cicilan' ? 'cicilan' : 'terjual';

            const sale = {
                id: generateId(),
                accountId: account.id,
                game: account.game,
                accountIdDisplay: account.spek || account.accountId,
                price: sellPrice,
                buyerName: account.buyer,
                saleDate: sellDate,
                paymentType: paymentType,
                installmentCount: paymentType === 'cicilan' ? parseInt(document.getElementById('installmentCount').value) || 1 : 1
            };

            sales.push(sale);

            saveData();
            renderAccounts();
            renderSales();
            updateDashboard();
            renderKalenderKeuangan(); // Update kalender keuangan dengan keuntungan otomatis
            renderAkunMasukHarian(); // Update akun masuk harian
            closeSellModal();

            alert('✅ Akun berhasil dijual!');
        });

        // Open installment payment modal
        function openInstallmentModal(id) {
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            const totalAmount = account.targetPrice || account.sellPrice || account.buyPrice || 0;
            const paidAmount = account.installmentPaid || 0;
            const remainingAmount = totalAmount - paidAmount;

            document.getElementById('installmentAccountId').value = account.id;
            document.getElementById('installmentAccountInfo').value = `${account.game.toUpperCase()} - ${account.spek || account.accountId || 'Akun'}`;
            document.getElementById('installmentTotalAmount').value = formatRupiah(totalAmount);
            document.getElementById('installmentPaidAmount').value = formatRupiah(paidAmount);
            document.getElementById('installmentRemainingAmount').value = formatRupiah(remainingAmount);
            document.getElementById('installmentPaymentAmount').value = '';
            document.getElementById('installmentPaymentDate').value = new Date().toISOString().split('T')[0];

            document.getElementById('installmentModal').classList.add('show');
        }

        function closeInstallmentModal() {
            document.getElementById('installmentModal').classList.remove('show');
        }

        // Open edit installment modal
        function openEditInstallmentModal(id) {
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            const totalAmount = account.targetPrice || account.sellPrice || account.buyPrice || 0;
            const paidAmount = account.installmentPaid || 0;
            const remainingAmount = totalAmount - paidAmount;

            document.getElementById('editInstallmentAccountId').value = account.id;
            document.getElementById('editInstallmentAccountInfo').value = `${account.game.toUpperCase()} - ${account.spek || account.accountId || 'Akun'}`;
            document.getElementById('editInstallmentBuyer').value = account.buyer || '-';
            document.getElementById('editInstallmentBuyDate').value = account.buyDate || '';
            document.getElementById('editInstallmentSellDate').value = account.sellDate || '';
            document.getElementById('editInstallmentTargetPrice').value = 'Rp ' + new Intl.NumberFormat('id-ID').format(totalAmount);
            document.getElementById('editInstallmentPaid').value = 'Rp ' + new Intl.NumberFormat('id-ID').format(paidAmount);
            document.getElementById('editInstallmentRemaining').value = 'Rp ' + new Intl.NumberFormat('id-ID').format(remainingAmount);

            document.getElementById('editInstallmentModal').classList.add('show');
        }

        function closeEditInstallmentModal() {
            document.getElementById('editInstallmentModal').classList.remove('show');
        }

        // Update remaining amount when editing
        document.getElementById('editInstallmentTargetPrice').addEventListener('input', function() {
            const targetPrice = parseRupiah(this.value);
            const paid = parseRupiah(document.getElementById('editInstallmentPaid').value);
            const remaining = targetPrice - paid;
            document.getElementById('editInstallmentRemaining').value = formatRupiah(remaining > 0 ? remaining : 0);
        });

        document.getElementById('editInstallmentPaid').addEventListener('input', function() {
            const targetPrice = parseRupiah(document.getElementById('editInstallmentTargetPrice').value);
            const paid = parseRupiah(this.value);
            const remaining = targetPrice - paid;
            document.getElementById('editInstallmentRemaining').value = formatRupiah(remaining > 0 ? remaining : 0);
        });

        // Handle edit installment form submit
        document.getElementById('editInstallmentForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('editInstallmentAccountId').value;
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            const newTargetPrice = parseRupiah(document.getElementById('editInstallmentTargetPrice').value);
            const newPaidAmount = parseRupiah(document.getElementById('editInstallmentPaid').value);
            const newBuyer = document.getElementById('editInstallmentBuyer').value || '-';
            const newBuyDate = document.getElementById('editInstallmentBuyDate').value;
            const newSellDate = document.getElementById('editInstallmentSellDate').value;

            if (newTargetPrice <= 0) {
                alert('❌ Harga target jual harus lebih dari 0!');
                return;
            }

            if (newPaidAmount > newTargetPrice) {
                alert('❌ Jumlah yang sudah dibayar tidak boleh melebihi total cicilan!');
                return;
            }

            // Update account
            account.targetPrice = newTargetPrice;
            account.installmentPaid = newPaidAmount;
            account.buyer = newBuyer;
            if (newBuyDate) account.buyDate = newBuyDate;
            if (newSellDate) account.sellDate = newSellDate;

            const remainingAmount = newTargetPrice - newPaidAmount;
            if (remainingAmount <= 0) {
                if (confirm('✅ Cicilan sudah LUNAS! Pindahkan ke Stok Terjual?')) {
                    account.status = 'terjual';
                }
            }

            saveData();
            updateDashboard();
            updateStockSummary();
            renderKalenderKeuangan(); // Update kalender keuangan dengan keuntungan otomatis
            renderAkunMasukHarian(); // Update akun masuk harian
            closeEditInstallmentModal();

            alert('✅ Data cicilan berhasil diupdate!');
        });

        // Handle installment payment form submit
        document.getElementById('installmentForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('installmentAccountId').value;
            const account = accounts.find(a => a.id === id);
            if (!account) return;

            const paymentAmount = parseRupiah(document.getElementById('installmentPaymentAmount').value);
            
            if (paymentAmount <= 0) {
                alert('❌ Nominal pembayaran harus lebih dari 0!');
                return;
            }

            const totalAmount = account.sellPrice || account.targetPrice || account.buyPrice || 0;
            const currentPaid = account.installmentPaid || 0;
            const newPaid = currentPaid + paymentAmount;

            if (newPaid > totalAmount) {
                alert(`❌ Pembayaran melebihi sisa cicilan! Sisa: ${formatRupiah(totalAmount - currentPaid)}`);
                return;
            }

            // Update paid amount
            account.installmentPaid = newPaid;

            // If fully paid, move to terjual
            if (newPaid >= totalAmount) {
                if (confirm('✅ Cicilan sudah LUNAS! Pindahkan ke Stok Terjual?')) {
                    account.status = 'terjual';
                    account.sellDate = document.getElementById('installmentPaymentDate').value || new Date().toISOString().split('T')[0];
                }
            }

            saveData();
            updateDashboard();
            updateStockSummary();
            renderKalenderKeuangan(); // Update kalender keuangan dengan keuntungan otomatis
            renderAkunMasukHarian(); // Update akun masuk harian
            closeInstallmentModal();

            alert('✅ Pembayaran cicilan berhasil dicatat!');
        });

        // Delete account
        function deleteAccount(id) {
            if (!confirm('Yakin ingin menghapus akun ini?')) return;

            accounts = accounts.filter(a => a.id !== id);
            saveData();
            renderAccounts();
            updateDashboard();
        }

        // Delete sale
        function deleteSale(id) {
            if (!confirm('Yakin ingin menghapus riwayat penjualan ini?')) return;

            const sale = sales.find(s => s.id === id);
            if (sale) {
                const account = accounts.find(a => a.id === sale.accountId);
                if (account) {
                    account.status = 'aktif';
                }
            }

            sales = sales.filter(s => s.id !== id);
            saveData();
            renderAccounts();
            renderSales();
            updateDashboard();
        }

        // Initialize
        function initialize() {
            console.log('Initializing...');
            try {
                loadData();
                initCalendar();
                renderAccounts();
                renderSales();
                renderWishlist();
                updateDashboard();
                searchBuyerAccounts(); // Load buyer search accounts
                renderKalenderKeuangan(); // Load calendar keuangan
                renderAkunMasukHarian(); // Load akun masuk harian
                console.log('Initialization complete');
            } catch (e) {
                console.error('Initialization error:', e);
            }
        }

        // Run on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }

        // Auto-save on page unload
        window.addEventListener('beforeunload', function() {
            saveData();
        });

        // Auto-save every 30 seconds
        setInterval(function() {
            saveData();
        }, 30000);

        // Show add search form
        function showAddSearchForm() {
            const form = document.getElementById('addSearchForm');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }

        // Add search account
        function addSearchAccount() {
            const spek = document.getElementById('addSearchSpek').value.trim();
            const rank = document.getElementById('addSearchRank').value.trim();
            const game = document.getElementById('addSearchGame').value;
            const hargaBeli = parseRupiah(document.getElementById('addSearchHargaBeli').value);
            const hargaJual = parseRupiah(document.getElementById('addSearchHargaJual').value);
            const penjual = document.getElementById('addSearchPenjual').value.trim();
            const pembeli = document.getElementById('addSearchPembeli').value.trim();
            const bulan = document.getElementById('addSearchBulan').value;

            if (!spek) {
                alert('⚠️ Spesifikasi akun harus diisi!');
                return;
            }

            if (!bulan) {
                alert('⚠️ Pilih bulan terlebih dahulu!');
                return;
            }

            const [year, month] = bulan.split('-').map(Number);
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            const account = {
                id: generateId(),
                spek: spek,
                rank: rank || '-',
                game: game,
                hargaBeli: hargaBeli || 0,
                hargaJual: hargaJual || 0,
                penjual: penjual || '-',
                pembeli: pembeli || '-',
                bulan: bulan,
                bulanText: `${monthNames[month]} ${year}`,
                keuntungan: (hargaJual || 0) - (hargaBeli || 0)
            };

            buyerSearchAccounts.push(account);
            saveData();

            // Clear form
            document.getElementById('addSearchSpek').value = '';
            document.getElementById('addSearchRank').value = '';
            document.getElementById('addSearchHargaBeli').value = '';
            document.getElementById('addSearchHargaJual').value = '';
            document.getElementById('addSearchPenjual').value = '';
            document.getElementById('addSearchPembeli').value = '';
            document.getElementById('addSearchBulan').value = '';

            // Hide form
            document.getElementById('addSearchForm').style.display = 'none';

            // Refresh display
            searchBuyerAccounts();

            alert('✅ Akun berhasil ditambahkan ke daftar pencarian!');
        }

        // Display all buyer search accounts
        function searchBuyerAccounts() {
            const filtered = buyerSearchAccounts;

            // Update summary
            document.getElementById('searchResultsSummary').style.display = 'grid';
            document.getElementById('searchResultCount').textContent = filtered.length;
            
            const totalBeli = filtered.reduce((sum, a) => sum + (a.hargaBeli || 0), 0);
            const totalJual = filtered.reduce((sum, a) => sum + (a.hargaJual || 0), 0);
            const totalProfit = filtered.reduce((sum, a) => sum + (a.keuntungan || 0), 0);

            document.getElementById('searchTotalBeli').textContent = formatRupiah(totalBeli);
            document.getElementById('searchTotalJual').textContent = formatRupiah(totalJual);
            
            const profitEl = document.getElementById('searchTotalProfit');
            profitEl.textContent = (totalProfit >= 0 ? '+' : '') + formatRupiah(totalProfit);
            profitEl.style.color = 'white';

            // Render results
            const tbody = document.getElementById('searchResultsTable');

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10">
                            <div class="empty-state">
                                <p>Belum ada data pencarian. Klik "➕ Tambah Akun Pencarian" untuk menambahkan.</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filtered.map((a, index) => {
                const profitClass = a.keuntungan >= 0 ? 'cashflow-positive' : 'cashflow-negative';
                const profitSign = a.keuntungan >= 0 ? '+' : '';
                const gameBadge = a.game === 'ff' ? 'badge-ff' : 'badge-ml';
                const gameText = a.game === 'ff' ? 'FF' : 'ML';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${a.spek || '-'}</td>
                        <td>${a.rank || '-'}</td>
                        <td><span class="badge ${gameBadge}">${gameText}</span></td>
                        <td>${formatRupiah(a.hargaBeli)}</td>
                        <td>${formatRupiah(a.hargaJual)}</td>
                        <td>${a.penjual || '-'}</td>
                        <td>${a.pembeli || '-'}</td>
                        <td class="${profitClass}" style="font-weight: bold;">${profitSign}${formatRupiah(a.keuntungan)}</td>
                        <td>${a.bulanText || '-'}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteSearchAccount('${a.id}')" style="padding: 5px 10px; font-size: 0.8rem;" title="Hapus">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Delete search account
        function deleteSearchAccount(id) {
            if (!confirm('Yakin ingin menghapus akun ini dari daftar pencarian?')) return;

            buyerSearchAccounts = buyerSearchAccounts.filter(a => a.id !== id);
            saveData();
            searchBuyerAccounts();
        }

        // Show add keuangan form
        function showAddKeuanganForm() {
            const form = document.getElementById('addKeuanganForm');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('keuanganTanggal').value = today;
        }

        // Add keuangan transaction
        function addKeuanganTransaction() {
            const tanggal = document.getElementById('keuanganTanggal').value;
            const tipe = document.getElementById('keuanganTipe').value;
            const jumlah = parseRupiah(document.getElementById('keuanganJumlah').value);
            const kategori = document.getElementById('keuanganKategori').value.trim();
            const keterangan = document.getElementById('keuanganKeterangan').value.trim();

            if (!tanggal) {
                alert('⚠️ Pilih tanggal terlebih dahulu!');
                return;
            }

            if (!jumlah || jumlah <= 0) {
                alert('⚠️ Jumlah harus lebih dari 0!');
                return;
            }

            const transaction = {
                id: generateId(),
                tanggal: tanggal,
                tipe: tipe,
                jumlah: jumlah,
                kategori: kategori || '-',
                keterangan: keterangan || '-'
            };

            keuanganTransactions.push(transaction);
            saveData();

            // Clear form
            document.getElementById('keuanganJumlah').value = '';
            document.getElementById('keuanganKategori').value = '';
            document.getElementById('keuanganKeterangan').value = '';

            // Hide form
            document.getElementById('addKeuanganForm').style.display = 'none';

            // Refresh display
            renderKalenderKeuangan();

            alert('✅ Transaksi berhasil ditambahkan!');
        }

        // Delete keuangan transaction
        function deleteKeuanganTransaction(id) {
            if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

            keuanganTransactions = keuanganTransactions.filter(t => t.id !== id);
            saveData();
            renderKalenderKeuangan();
        }

        // Render kalender keuangan
        function renderKalenderKeuangan() {
            const monthSelect = document.getElementById('kalenderBulanSelect').value;
            const [year, month] = monthSelect.split('-').map(Number);
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

            // Get days in month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();

            // Filter transactions for this month
            const monthTransactions = keuanganTransactions.filter(t => {
                const parts = t.tanggal.split('-');
                const tYear = parseInt(parts[0]);
                const tMonth = parseInt(parts[1]) - 1;
                return tYear === year && tMonth === month;
            });

            // Get sold accounts for this month (keuntungan otomatis dari FF & ML)
            const soldAccountsThisMonth = accounts.filter(a => {
                if (a.sellDate && a.status === 'terjual') {
                    const parts = a.sellDate.split('-');
                    const accYear = parseInt(parts[0]);
                    const accMonth = parseInt(parts[1]) - 1;
                    return accYear === year && accMonth === month;
                }
                return false;
            });

            // Calculate keuntungan otomatis per hari dari akun terjual
            const dailyKeuntungan = {};
            soldAccountsThisMonth.forEach(account => {
                if (account.sellDate) {
                    if (!dailyKeuntungan[account.sellDate]) {
                        dailyKeuntungan[account.sellDate] = {
                            pemasukan: 0,
                            pengeluaran: 0,
                            profit: 0,
                            accounts: []
                        };
                    }
                    const sellPrice = account.sellPrice || 0;
                    const buyPrice = account.buyPrice || 0;
                    const profit = sellPrice - buyPrice;
                    dailyKeuntungan[account.sellDate].pemasukan += sellPrice;
                    dailyKeuntungan[account.sellDate].profit += profit;
                    dailyKeuntungan[account.sellDate].accounts.push({
                        game: account.game,
                        spek: account.spek || account.accountId,
                        profit: profit
                    });
                }
            });

            // Merge dengan transaksi manual
            const mergedTransactions = [...monthTransactions];
            
            // Tambahkan transaksi otomatis dari akun terjual
            Object.keys(dailyKeuntungan).forEach(date => {
                const data = dailyKeuntungan[date];
                // Cari apakah sudah ada transaksi manual di tanggal ini
                const existingIdx = mergedTransactions.findIndex(t => t.tanggal === date);
                if (existingIdx >= 0) {
                    // Update transaksi yang ada
                    mergedTransactions[existingIdx].jumlah += data.pemasukan;
                    mergedTransactions[existingIdx].autoProfit = data.profit;
                    mergedTransactions[existingIdx].autoAccounts = data.accounts;
                } else {
                    // Tambah transaksi baru
                    if (data.pemasukan > 0) {
                        mergedTransactions.push({
                            id: generateId() + '_auto',
                            tanggal: date,
                            tipe: 'pemasukan',
                            jumlah: data.pemasukan,
                            kategori: 'Penjualan Akun',
                            keterangan: `${data.accounts.length} akun terjual (keuntungan: ${formatRupiah(data.profit)})`,
                            autoProfit: data.profit,
                            autoAccounts: data.accounts
                        });
                    }
                }
            });

            // Calculate totals
            const totalPemasukan = mergedTransactions
                .filter(t => t.tipe === 'pemasukan')
                .reduce((sum, t) => sum + t.jumlah, 0);
            const totalPengeluaran = mergedTransactions
                .filter(t => t.tipe === 'pengeluaran')
                .reduce((sum, t) => sum + t.jumlah, 0);
            const totalProfitOtomatis = soldAccountsThisMonth.reduce((sum, a) => 
                sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);
            const keuntungan = totalPemasukan - totalPengeluaran;

            // Update summary cards
            document.getElementById('kalenderTotalPemasukan').textContent = formatRupiah(totalPemasukan);
            document.getElementById('kalenderTotalPengeluaran').textContent = formatRupiah(totalPengeluaran);

            const keuntunganEl = document.getElementById('kalenderKeuntungan');
            keuntunganEl.textContent = (keuntungan >= 0 ? '+' : '') + formatRupiah(keuntungan);
            keuntunganEl.style.color = 'white';

            // Render calendar grid
            const grid = document.getElementById('kalenderGrid');
            let html = '';

            // Day headers
            dayNames.forEach(day => {
                html += `<div style="background: linear-gradient(135deg, #042C53 0%, #0C447C 50%, #185FA5 100%); color:var(--gray-800); padding: 12px; text-align: center; font-weight: bold; font-size: 0.85rem;">${day}</div>`;
            });

            // Empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                html += `<div style="background: #f9f9f9; padding: 10px; min-height: 100px;"></div>`;
            }

            // Days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayTransactions = mergedTransactions.filter(t => t.tanggal === dateStr);
                const dayKeuntungan = dailyKeuntungan[dateStr];

                const dayPemasukan = dayTransactions
                    .filter(t => t.tipe === 'pemasukan')
                    .reduce((sum, t) => sum + t.jumlah, 0);
                const dayPengeluaran = dayTransactions
                    .filter(t => t.tipe === 'pengeluaran')
                    .reduce((sum, t) => sum + t.jumlah, 0);
                const dayProfitOtomatis = dayKeuntungan ? dayKeuntungan.profit : 0;

                let bgColor = '#fff';
                if (dayPemasukan > 0 && dayPengeluaran === 0) bgColor = '#e8f5e9';
                else if (dayPengeluaran > 0 && dayPemasukan === 0) bgColor = '#ffebee';
                else if (dayPemasukan > 0 && dayPengeluaran > 0) bgColor = '#fff3e0';

                // Highlight jika ada keuntungan otomatis
                if (dayProfitOtomatis !== 0) {
                    bgColor = dayProfitOtomatis >= 0 ? '#d4edda' : '#f8d7da';
                }

                html += `
                    <div style="background: ${bgColor}; padding: 10px; min-height: 100px; border: 1px solid #f0f0f0;">
                        <div style="font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color:var(--gray-800);">${day}</div>
                        ${dayProfitOtomatis !== 0 ? `<div style="font-size: 0.7rem; color: ${dayProfitOtomatis >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">🎮 ${dayProfitOtomatis >= 0 ? '+' : ''}${formatRupiah(dayProfitOtomatis)}</div>` : ''}
                        ${dayPemasukan > 0 ? `<div style="font-size: 0.75rem; color: #27ae60;">+${formatRupiah(dayPemasukan)}</div>` : ''}
                        ${dayPengeluaran > 0 ? `<div style="font-size: 0.75rem; color: #e74c3c;">-${formatRupiah(dayPengeluaran)}</div>` : ''}
                    </div>
                `;
            }

            grid.innerHTML = html;

            // Render transaction table
            const tbody = document.getElementById('kalenderTransaksiTable');
            if (mergedTransactions.length === 0 && soldAccountsThisMonth.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #5B9ED8;">Belum ada transaksi di ${monthNames[month]} ${year}</td></tr>`;
                return;
            }

            const sorted = mergedTransactions.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
            tbody.innerHTML = sorted.map((t, i) => {
                const isPemasukan = t.tipe === 'pemasukan';
                const isAuto = t.id && t.id.includes('_auto');
                return `
                    <tr style="${isAuto ? 'background: #f0f8ff;' : ''}">
                        <td>${i + 1}</td>
                        <td>${formatDate(t.tanggal)}</td>
                        <td><span class="badge" style="background: ${isAuto ? '#9b59b6' : (isPemasukan ? '#27ae60' : '#e74c3c')}; color:var(--gray-800);">${isAuto ? '🎮 Otomatis' : (isPemasukan ? '💰 Pemasukan' : '💸 Pengeluaran')}</span></td>
                        <td>${t.kategori}</td>
                        <td>${t.keterangan}</td>
                        <td style="color: ${isPemasukan ? '#27ae60' : '#e74c3c'}; font-weight: bold;">${isPemasukan ? '+' : '-'}${formatRupiah(t.jumlah)}</td>
                        <td>
                            ${isAuto ? '<span style="color: #5B9ED8; font-size: 0.8rem;">Auto</span>' : 
                            `<button class="btn btn-danger" onclick="deleteKeuanganTransaction('${t.id}')" style="padding: 5px 10px; font-size: 0.8rem;" title="Hapus">🗑️</button>`}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Render akun masuk harian
        function renderAkunMasukHarian() {
            const monthSelect = document.getElementById('akunMasukBulanSelect').value;
            const [year, month] = monthSelect.split('-').map(Number);
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

            // Get days in month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();

            // Filter accounts that entered in this month
            const monthAccounts = accounts.filter(a => {
                if (a.buyDate) {
                    const parts = a.buyDate.split('-');
                    const accYear = parseInt(parts[0]);
                    const accMonth = parseInt(parts[1]) - 1;
                    return accYear === year && accMonth === month;
                }
                return false;
            });

            // Calculate keuntungan per hari dari akun yang masuk
            const dailyAccounts = {};
            monthAccounts.forEach(account => {
                if (account.buyDate) {
                    if (!dailyAccounts[account.buyDate]) {
                        dailyAccounts[account.buyDate] = [];
                    }
                    dailyAccounts[account.buyDate].push(account);
                }
            });

            // Update summary cards
            const ffAccounts = monthAccounts.filter(a => a.game === 'ff');
            const mlAccounts = monthAccounts.filter(a => a.game === 'ml');
            const totalModal = monthAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0);

            document.getElementById('akunMasukTotal').textContent = monthAccounts.length;
            document.getElementById('akunMasukFF').textContent = ffAccounts.length;
            document.getElementById('akunMasukML').textContent = mlAccounts.length;
            document.getElementById('akunMasukModal').textContent = formatRupiah(totalModal);

            // Render calendar grid
            const grid = document.getElementById('akunMasukGrid');
            let html = '';

            // Day headers
            dayNamesShort.forEach(day => {
                html += `<div style="background: linear-gradient(135deg, #042C53 0%, #0C447C 50%, #185FA5 100%); color:var(--gray-800); padding: 12px; text-align: center; font-weight: bold; font-size: 0.85rem;">${day}</div>`;
            });

            // Empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                html += `<div style="background: #f9f9f9; padding: 10px; min-height: 100px;"></div>`;
            }

            // Days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayAccs = dailyAccounts[dateStr] || [];
                const dayCount = dayAccs.length;
                const dayFF = dayAccs.filter(a => a.game === 'ff').length;
                const dayML = dayAccs.filter(a => a.game === 'ml').length;

                let bgColor = '#fff';
                if (dayCount > 0) {
                    bgColor = '#e3f2fd';
                }

                html += `
                    <div style="background: ${bgColor}; padding: 10px; min-height: 100px; border: 1px solid #f0f0f0;">
                        <div style="font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color:var(--gray-800);">${day}</div>
                        ${dayCount > 0 ? `<div style="font-size: 0.75rem; color: #667eea; font-weight: bold;">📥 ${dayCount} akun</div>` : ''}
                        ${dayFF > 0 ? `<div style="font-size: 0.7rem; color: #f39c12;">🔶 FF: ${dayFF}</div>` : ''}
                        ${dayML > 0 ? `<div style="font-size: 0.7rem; color: #3498db;">🔵 ML: ${dayML}</div>` : ''}
                    </div>
                `;
            }

            grid.innerHTML = html;

            // Render accounts table sorted by date
            const tbody = document.getElementById('akunMasukTable');
            if (monthAccounts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px; color: #5B9ED8;">Tidak ada akun masuk di ${monthNames[month]} ${year}</td></tr>`;
                return;
            }

            const sorted = monthAccounts.sort((a, b) => new Date(a.buyDate) - new Date(b.buyDate));
            tbody.innerHTML = sorted.map((a, i) => {
                const buyDate = new Date(a.buyDate);
                const dayName = dayNames[buyDate.getDay()];
                const gameBadge = a.game === 'ff' ? 'badge-ff' : 'badge-ml';
                const gameText = a.game === 'ff' ? 'FF' : 'ML';
                const statusBadge = a.status === 'aktif' ? 'badge-aktif' :
                                   a.status === 'terjual' ? 'badge-terjual' : 'badge-cicilan';
                const statusText = a.status === 'aktif' ? '✅ Ready' :
                                  a.status === 'terjual' ? '❌ Terjual' : '💳 Cicilan';

                return `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${formatDate(a.buyDate)}</td>
                        <td style="font-weight: 600;">${dayName}</td>
                        <td><span class="badge ${gameBadge}">${gameText}</span></td>
                        <td>${a.spek || a.accountId || '-'}</td>
                        <td>${a.rank || a.level || '-'}</td>
                        <td style="font-weight: bold;">${formatRupiah(a.buyPrice || 0)}</td>
                        <td><span class="badge ${statusBadge}">${statusText}</span></td>
                        <td>
                            <button class="btn btn-warning btn-icon btn-edit" onclick="openEditModal('${a.id}')" title="Edit" style="padding: 5px 8px; font-size: 0.8rem;">✏️</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Load data from localStorage
        function loadData() {
            console.log('loadData called...');
            const savedAccounts = localStorage.getItem('ffml_accounts');
            if (savedAccounts) {
                try {
                    accounts = JSON.parse(savedAccounts);
                    console.log('✅ Loaded', accounts.length, 'accounts from localStorage');
                } catch (e) {
                    console.error('❌ Error parsing saved accounts:', e);
                    accounts = [];
                }
            }

            const savedSales = localStorage.getItem('ffml_sales');
            if (savedSales) {
                try {
                    sales = JSON.parse(savedSales);
                    console.log('✅ Loaded', sales.length, 'sales from localStorage');
                } catch (e) {
                    console.error('❌ Error parsing saved sales:', e);
                    sales = [];
                }
            }

            // Load buyer search accounts (separate from personal stock)
            const savedBuyerSearch = localStorage.getItem('ffml_buyer_search');
            if (savedBuyerSearch) {
                try {
                    buyerSearchAccounts = JSON.parse(savedBuyerSearch);
                    console.log('✅ Loaded', buyerSearchAccounts.length, 'buyer search accounts');
                } catch (e) {
                    console.error('❌ Error parsing buyer search accounts:', e);
                    buyerSearchAccounts = [];
                }
            }

            // Load keuangan transactions
            const savedKeuangan = localStorage.getItem('ffml_keuangan');
            if (savedKeuangan) {
                try {
                    keuanganTransactions = JSON.parse(savedKeuangan);
                    console.log('✅ Loaded', keuanganTransactions.length, 'keuangan transactions');
                } catch (e) {
                    console.error('❌ Error parsing keuangan transactions:', e);
                    keuanganTransactions = [];
                }
            }

            // Load wishlist items
            const savedWishlist = localStorage.getItem('ffml_wishlist');
            if (savedWishlist) {
                try {
                    wishlistItems = JSON.parse(savedWishlist);
                    console.log('✅ Loaded', wishlistItems.length, 'wishlist items');
                } catch (e) {
                    console.error('❌ Error parsing wishlist items:', e);
                    wishlistItems = [];
                }
            }

            // Load Jurnal Bisnis
            const savedJurnal = localStorage.getItem('ffml_jurnal');
            if (savedJurnal) {
                try {
                    jurnalBisnis = JSON.parse(savedJurnal);
                    console.log('✅ Loaded', jurnalBisnis.length, 'jurnal items');
                } catch (e) {
                    console.error('❌ Error parsing jurnal items:', e);
                    jurnalBisnis = [];
                }
            }
            // Ensure render is called on load
            renderJurnal();

            console.log('Final data - Accounts:', accounts.length, 'Sales:', sales.length, 'Buyer Search:', buyerSearchAccounts.length, 'Keuangan:', keuanganTransactions.length, 'Wishlist:', wishlistItems.length, 'Jurnal:', jurnalBisnis.length);
        }

        // Chart instances
        let advChartSales = null;
        let advChartStatus = null;
        let advChartProfit = null;
        let advChartGame = null;

        // Update charts
        function updateCharts() {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            
            // Destroy existing charts
            if (advChartSales) advChartSales.destroy();
            if (advChartStatus) advChartStatus.destroy();
            if (advChartProfit) advChartProfit.destroy();
            if (advChartGame) advChartGame.destroy();

            // === FILTER LOGIC ===
            const filterMonthVal = document.getElementById('globalFilterMonth').value;
            const filterYearVal = document.getElementById('globalFilterYear').value;
            let currentAccounts = accounts;
            
            if (filterMonthVal !== 'all') {
                const monthNum = parseInt(filterMonthVal);
                const yearNum = parseInt(filterYearVal);
                
                currentAccounts = accounts.filter(a => {
                    let match = false;
                    if (a.buyDate) {
                        const bParts = a.buyDate.split('-');
                        if (parseInt(bParts[0]) === yearNum && (parseInt(bParts[1]) - 1) === monthNum) match = true;
                    }
                    if (a.status === 'terjual' && a.sellDate) {
                        const sParts = a.sellDate.split('-');
                        if (parseInt(sParts[0]) === yearNum && (parseInt(sParts[1]) - 1) === monthNum) match = true;
                    }
                    return match;
                });
            }

            // 1. Calculate Core Data
            const readyCount = currentAccounts.filter(a => a.status === 'aktif').length;
            const soldCount = currentAccounts.filter(a => a.status === 'terjual').length;
            const cicilanCount = currentAccounts.filter(a => a.status === 'cicilan').length;
            const totalAcc = currentAccounts.length;
            const soldPercent = totalAcc > 0 ? Math.round((soldCount / totalAcc) * 100) : 0;
            
            const ffCount = currentAccounts.filter(a => a.game === 'ff').length;
            const mlCount = currentAccounts.filter(a => a.game === 'ml').length;

            document.getElementById('advStatusCenterVal').textContent = soldPercent + '%';

            // By Month Logic
            const profitByMonth = {};
            const currentDate = new Date();
            const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
            
            // Get previous month
            let prevYear = currentDate.getFullYear();
            let prevMonthIndex = currentDate.getMonth() - 1;
            if (prevMonthIndex < 0) { prevMonthIndex = 11; prevYear--; }
            const prevMonthKey = `${prevYear}-${prevMonthIndex}`;

            currentAccounts.forEach(a => {
                if (a.buyDate) {
                    const parts = a.buyDate.split('-');
                    const year = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const key = `${year}-${month}`;
                    if (!profitByMonth[key]) profitByMonth[key] = { profit: 0, sales: 0, revenue: 0, cost: 0 };
                    
                    profitByMonth[key].cost += (a.buyPrice || 0);

                    if (a.status === 'terjual' && a.sellDate) {
                        const sellParts = a.sellDate.split('-');
                        const sellYear = parseInt(sellParts[0]);
                        const sellMonth = parseInt(sellParts[1]) - 1;
                        const sellKey = `${sellYear}-${sellMonth}`;
                        
                        if (!profitByMonth[sellKey]) profitByMonth[sellKey] = { profit: 0, sales: 0, revenue: 0, cost: 0 };
                        
                        const profit = (a.sellPrice || 0) - (a.buyPrice || 0);
                        profitByMonth[sellKey].profit += profit;
                        profitByMonth[sellKey].revenue += (a.sellPrice || 0);
                        profitByMonth[sellKey].sales++;
                    }
                }
            });

            const monthKeys = Object.keys(profitByMonth).sort();
            const profitLabels = monthKeys.map(k => {
                const [y, m] = k.split('-');
                return monthNames[parseInt(m)] + ' ' + y;
            });
            const profitData = monthKeys.map(k => profitByMonth[k].profit);
            const revenueData = monthKeys.map(k => profitByMonth[k].revenue);
            const salesData = monthKeys.map(k => profitByMonth[k].sales);

            // Update Mini Cards
            const currStats = profitByMonth[currentMonthKey] || { profit: 0, sales: 0 };
            const prevStats = profitByMonth[prevMonthKey] || { profit: 0, sales: 0 };
            
            document.getElementById('advTotalProfit').textContent = 'Rp ' + new Intl.NumberFormat('id-ID').format(currStats.profit);
            document.getElementById('advSoldThisMonth').textContent = currStats.sales;
            
            const profitDiff = prevStats.profit > 0 ? Math.round(((currStats.profit - prevStats.profit) / prevStats.profit) * 100) : 100;
            const salesDiff = prevStats.sales > 0 ? Math.round(((currStats.sales - prevStats.sales) / prevStats.sales) * 100) : 100;

            const elTrendP = document.getElementById('advTrendProfit');
            if(currStats.profit >= prevStats.profit) {
                elTrendP.className = 'adv-mini-trend positive';
                elTrendP.textContent = `↑ ${profitDiff}% vs bulan lalu`;
            } else {
                elTrendP.className = 'adv-mini-trend';
                elTrendP.textContent = `↓ ${Math.abs(profitDiff)}% vs bulan lalu`;
            }

            const elTrendS = document.getElementById('advTrendSold');
            if(currStats.sales >= prevStats.sales) {
                elTrendS.className = 'adv-mini-trend positive';
                elTrendS.textContent = `↑ ${salesDiff}% vs bulan lalu`;
            } else {
                elTrendS.className = 'adv-mini-trend';
                elTrendS.textContent = `↓ ${Math.abs(salesDiff)}% vs bulan lalu`;
            }
            
            const totalProfits = currentAccounts.reduce((s, a) => s + (a.status === 'terjual' ? ((a.sellPrice||0) - (a.buyPrice||0)) : 0), 0);
            const totalBuy = currentAccounts.reduce((s, a) => s + (a.status === 'terjual' ? (a.buyPrice||0) : 0), 0);
            const avgMargin = totalBuy > 0 ? Math.round((totalProfits / totalBuy) * 100) : 0;
            document.getElementById('advAvgMargin').textContent = avgMargin + '%';

            // Fill Recent Activity
            const recentSales = currentAccounts.filter(a => a.status === 'terjual' && a.sellDate).sort((a,b) => new Date(b.sellDate) - new Date(a.sellDate)).slice(0, 4);
            const recentHTML = recentSales.length > 0 ? recentSales.map(a => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px;">
                    <div>
                        <div style="color:#fff; font-size:0.8rem; font-weight:700;">${a.spek || a.accountId}</div>
                        <div style="color:#94a3b8; font-size:0.7rem;">${a.game.toUpperCase()} - ${formatDate(a.sellDate)}</div>
                    </div>
                    <div style="color:#10b981; font-weight:700; font-size:0.85rem;">+${formatRupiah((a.sellPrice||0) - (a.buyPrice||0))}</div>
                </div>
            `).join('') : '<div style="color:#94a3b8; font-size:0.8rem; text-align:center;">Belum ada penjualan</div>';
            document.getElementById('advTopSalesList').innerHTML = recentHTML;


            // ================= CHART RENDERING ================= //
            
            // 1. Line Chart: Pendapatan vs Penjualan
            const ctxSales = document.getElementById('advChartSales').getContext('2d');
            let gradientRev = ctxSales.createLinearGradient(0, 0, 0, 400);
            gradientRev.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
            gradientRev.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

            advChartSales = new Chart(ctxSales, {
                type: 'line',
                data: {
                    labels: profitLabels,
                    datasets: [
                        {
                            label: 'Pendapatan (IDR)',
                            data: revenueData,
                            borderColor: '#3b82f6',
                            borderWidth: 3,
                            backgroundColor: gradientRev,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#3b82f6',
                            pointRadius: 4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Unit Terjual',
                            data: salesData,
                            borderColor: '#f59e0b',
                            borderWidth: 3,
                            backgroundColor: 'transparent',
                            borderDash: [5, 5],
                            tension: 0.4,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#f59e0b',
                            pointRadius: 4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { position: 'top', labels: { color: '#CBD5E1', font:{size:11} } } },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
                        y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', callback: v => 'Rp ' + new Intl.NumberFormat('id-ID',{notation:'compact'}).format(v) } },
                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#94A3B8' } }
                    }
                }
            });

            // 2. Donut: Status
            advChartStatus = new Chart(document.getElementById('advChartStatus'), {
                type: 'doughnut',
                data: {
                    labels: ['Ready', 'Terjual', 'Cicilan'],
                    datasets: [{
                        data: [readyCount, soldCount, cicilanCount],
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { legend: { display:false } }
                }
            });

            // 3. Bar: Profit/Loss
            advChartProfit = new Chart(document.getElementById('advChartProfit'), {
                type: 'bar',
                data: {
                    labels: profitLabels.slice(-6), // Last 6 months
                    datasets: [{
                        label: 'Profit',
                        data: profitData.slice(-6),
                        backgroundColor: profitData.slice(-6).map(v => v >= 0 ? '#10b981' : '#ef4444'),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#94A3B8', font:{size:10} } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', font:{size:10}, callback: v => new Intl.NumberFormat('id-ID',{notation:'compact'}).format(v) } }
                    }
                }
            });

            // 4. Horizontal Bar: Game Dist
            advChartGame = new Chart(document.getElementById('advChartGame'), {
                type: 'bar',
                data: {
                    labels: ['Free Fire', 'Mobile Legends'],
                    datasets: [{
                        data: [ffCount, mlCount],
                        backgroundColor: ['#f97316', '#3b82f6'],
                        borderRadius: 6,
                        barThickness: 20
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false, grid: { display: false } },
                        y: { grid: { display: false }, ticks: { color: '#CBD5E1', font:{weight:'bold'} } }
                    }
                }
            });

        }
    
