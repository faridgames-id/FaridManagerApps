import { supabase } from './supabase';

/**
 * DataSyncQueue
 * Kelas yang mengatur antrean sinkronisasi dari data lokal ke Supabase.
 * Dirancang untuk mencegah race condition dan memprioritaskan cloud (Source of Truth).
 */
export default class DataSyncQueue {
    constructor(email) {
        this.email = email;
        this.queueKey = `ffml_${email}_sync_queue`;
        this.isProcessing = false;
    }

    /**
     * Memasukkan data terbaru ke dalam queue lokal.
     * Karena menggunakan model "Snapshot", kita cukup menimpa isi queue dengan snapshot terbaru.
     */
    enqueue(snapshot, userId) {
        // Increment versi (revision) dari snapshot
        const prevQueueStr = localStorage.getItem(this.queueKey);
        let version = 1;
        
        if (prevQueueStr) {
            try {
                const prevQueue = JSON.parse(prevQueueStr);
                // Jika versi snapshot sudah ada, terus tingkatkan
                if (prevQueue.snapshot && prevQueue.snapshot.version) {
                    version = prevQueue.snapshot.version + 1;
                }
            } catch (e) {
                console.error("Gagal membaca queue lama", e);
            }
        }

        // Pastikan snapshot juga mendapatkan version number terbaru
        const newSnapshot = { ...snapshot, version };

        const queueItem = {
            snapshot: newSnapshot,
            userId: userId,
            timestamp: Date.now(),
            retries: 0
        };

        try {
            localStorage.setItem(this.queueKey, JSON.stringify(queueItem));
            console.log(`[DataSyncQueue] Enqueued version ${version} to local queue.`);
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error("[DataSyncQueue] LocalStorage penuh!");
                // Alert jika perlu, atau diamkan dan biarkan sync langsung memproses
            }
            console.error("Gagal menyimpan antrean ke localStorage", e);
        }
    }

    /**
     * Memeriksa apakah ada antrean.
     */
    hasPending() {
        return localStorage.getItem(this.queueKey) !== null;
    }

    /**
     * Menghapus antrean lokal setelah berhasil tersinkron.
     */
    clearQueue() {
        localStorage.removeItem(this.queueKey);
    }

    /**
     * Memproses antrean yang ada. Akan melakukan retry dengan Exponential Backoff.
     */
    async processQueue(onSuccess, onError) {
        if (this.isProcessing) return;
        
        const queueStr = localStorage.getItem(this.queueKey);
        if (!queueStr) return; // Tidak ada yang perlu disinkronkan

        let queueItem;
        try {
            queueItem = JSON.parse(queueStr);
        } catch (e) {
            console.error("[DataSyncQueue] Invalid queue item, clearing queue.", e);
            this.clearQueue();
            return;
        }

        if (queueItem.retries >= 3) {
            console.error(`[DataSyncQueue] Sync gagal setelah ${queueItem.retries} percobaan. Data akan tetap di lokal, silakan periksa koneksi Anda.`);
            if (onError) onError(new Error("Maksimal retry tercapai"));
            // Jangan clear queue di sini agar data tidak hilang,
            // atau jika ingin me-reset retry bisa di-handle di tempat lain.
            return;
        }

        this.isProcessing = true;
        console.log(`[DataSyncQueue] Memulai proses sync versi ${queueItem.snapshot.version} (Retry: ${queueItem.retries})...`);

        try {
            // Gunakan Supabase UPSERT dengan data snapshot
            const { error } = await supabase
                .from('user_app_data')
                .upsert({
                    id: queueItem.userId,
                    accounts: queueItem.snapshot.accounts || [],
                    sales: queueItem.snapshot.sales || [],
                    buyer_search: queueItem.snapshot.buyer_search || [],
                    keuangan: queueItem.snapshot.keuangan || [],
                    wishlist: queueItem.snapshot.wishlist || [],
                    jurnal: queueItem.snapshot.jurnal || [],
                    version: queueItem.snapshot.version || 1, // field baru untuk version checking
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            console.log("[DataSyncQueue] Berhasil sync ke Cloud! Mengecek versi sebelum menghapus antrean.");
            
            // Simpan cache localStorage karena telah tervalidasi ke cloud
            this._saveCache(queueItem.snapshot, this.email);
            
            // Cek apakah ada antrean baru yang masuk saat proses sedang berjalan
            const currentQueueStr = localStorage.getItem(this.queueKey);
            if (currentQueueStr) {
                const currentQueue = JSON.parse(currentQueueStr);
                if (currentQueue.snapshot.version === queueItem.snapshot.version) {
                    this.clearQueue();
                } else {
                    console.log(`[DataSyncQueue] Antrean baru (versi ${currentQueue.snapshot.version}) ditemukan. Menahan clearQueue.`);
                }
            } else {
                this.clearQueue();
            }

            if (onSuccess) onSuccess();

        } catch (e) {
            console.error("[DataSyncQueue] Sync Gagal:", e.message);
            
            try {
                const currentQueueStr = localStorage.getItem(this.queueKey);
                if (currentQueueStr) {
                    const currentQueue = JSON.parse(currentQueueStr);
                    if (currentQueue.snapshot.version === queueItem.snapshot.version) {
                        currentQueue.retries += 1;
                        queueItem.retries = currentQueue.retries;
                        localStorage.setItem(this.queueKey, JSON.stringify(currentQueue));
                    } else {
                        console.log("[DataSyncQueue] Antrean baru ditemukan saat gagal. Retry pada antrean lama dibatalkan.");
                    }
                }
            } catch(err) {}
            
            if (onError) onError(e);

            // Jika masih di bawah batas, schedule retry dengan exponential backoff
            if (queueItem.retries < 3) {
                const backoffDelay = Math.pow(2, queueItem.retries) * 1000; // 2s, 4s, 8s...
                console.log(`[DataSyncQueue] Menjadwalkan retry dalam ${backoffDelay}ms...`);
                setTimeout(() => {
                    this.isProcessing = false;
                    this.processQueue(onSuccess, onError);
                }, backoffDelay);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Cache hasil save ke localStorage
     */
    _saveCache(snapshot, email) {
        try {
            localStorage.setItem(`ffml_${email}_accounts`, JSON.stringify(snapshot.accounts || []));
            localStorage.setItem(`ffml_${email}_sales`, JSON.stringify(snapshot.sales || []));
            localStorage.setItem(`ffml_${email}_buyer_search`, JSON.stringify(snapshot.buyer_search || []));
            localStorage.setItem(`ffml_${email}_keuangan`, JSON.stringify(snapshot.keuangan || []));
            localStorage.setItem(`ffml_${email}_wishlist`, JSON.stringify(snapshot.wishlist || []));
            localStorage.setItem(`ffml_${email}_jurnal`, JSON.stringify(snapshot.jurnal || []));
            localStorage.setItem(`ffml_${email}_lastSaved`, new Date().toISOString());
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn("[Cache] LocalStorage penuh, melewati caching lokal.");
            }
        }
    }
}
