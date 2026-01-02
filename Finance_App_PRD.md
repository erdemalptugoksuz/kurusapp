# Finans Takip Uygulaması - Product Requirements Document (PRD)

## 📋 Genel Bakış

Bu doküman, React Native Expo tabanlı kişisel finans takip uygulamasının Supabase veritabanı kurulumu için eksiksiz teknik gereksinimleri içerir.

### Tech Stack
- **Frontend**: React Native Expo
- **UI Framework**: Uniwind + Hero UI
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Storage**: Supabase Storage
- **Notifications**: Expo Notifications

---

## 🎯 Uygulama Özellikleri

### 1. Hesap Yönetimi
- Birden fazla hesap oluşturma (Banka hesapları, Kredi kartları)
- Her hesap için ayrı bakiye takibi
- Çoklu para birimi desteği (TRY, USD, EUR, GBP, JPY)
- Hesaplara renk ve ikon atama
- Başlangıç bakiyesi belirleme
- Hard delete (Hesap silinince kalıcı olarak kaldırılır)

### 2. İşlem Tipleri
- **Gelir**: Hesaba para girişi
- **Gider**: Hesaptan para çıkışı (başka bir hesaba havale/EFT yapıldığında da sadece gider olarak görünür)
- **Transfer**: Kendi hesapları arasında para transferi (gelir/gider hesabına dahil edilmez)

### 3. Kategoriler
- Önceden tanımlı sistem kategorileri
- Kullanıcıların özel kategori oluşturabilmesi
- Sınırsız alt kategori desteği
- Her kategoriye ikon ve renk atama
- Gelir ve gider için ayrı kategoriler

### 4. İşlemler (Transactions)
- Not/açıklama ekleme
- Fiş/fotoğraf ekleme (Supabase Storage)
- Gelecek tarihli işlem girişi
- İşlem düzenleme ve silme
- Transfer ücretleri (kaynak hesaptan kesilir)
- Gider işlemlerinde havale/EFT ücreti desteği

### 5. Tekrar Eden İşlemler (Abonelikler)
- Tekrarlama periyotları: Günlük, Haftalık, Aylık, Yıllık, Özel aralık
- Başlangıç ve bitiş tarihi (süresiz veya belirli tarihe kadar)
- Otomatik işleme alma veya kullanıcı onayı isteme seçenekleri
- Tutar değişkenliği (örn: elektrik faturası gibi her ay farklı tutarlar)
- Onaylanmayan işlemler için hatırlatma tekrarı

### 6. Bildirimler
- Push notification (Expo)
- Uygulama içi bildirimler
- Abonelik hatırlatmaları
- Kullanıcı bazlı bildirim ayarları
- Hatırlatma saati ve tekrar sıklığı özelleştirme

### 7. Raporlama ve Grafikler
- Günlük, haftalık, aylık, yıllık harcama görünümü
- Kategori bazlı harcama dağılımı
- Hesap bazlı bakiye takibi
- Grafik gösterimleri

### 8. Kullanıcı Yönetimi
- Her kullanıcı sadece kendi verilerini görür
- Email/Password authentication
- Timezone desteği (kullanıcıya göre değişken)
- Varsayılan para birimi ayarlama

---

## 🗄️ Veritabanı Şeması

### Tablolar

1. **profiles** - Kullanıcı profilleri
2. **currencies** - Para birimleri
3. **account_types** - Hesap tipleri (Normal Hesap, Kredi Kartı)
4. **accounts** - Kullanıcı hesapları
5. **categories** - Gelir/Gider kategorileri
6. **transaction_types** - İşlem tipleri (income, expense, transfer)
7. **transactions** - Tüm finansal işlemler
8. **recurring_frequencies** - Tekrarlama sıklıkları
9. **recurring_transactions** - Abonelikler ve tekrar eden işlemler
10. **notification_settings** - Kullanıcı bildirim ayarları
11. **pending_notifications** - Bekleyen/onay bekleyen bildirimler

---

## 📦 ADIM 1: Supabase SQL Kodlarının Çalıştırılması

Aşağıdaki SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın:

```sql
-- =====================================================
-- SUPABASE FİNANS TAKIP UYGULAMASI - VERİTABANI ŞEMASI
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. KULLANICI PROFİLİ
-- =====================================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    timezone TEXT DEFAULT 'Europe/Istanbul',
    default_currency_code TEXT DEFAULT 'TRY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. PARA BİRİMLERİ
-- =====================================================

CREATE TABLE currencies (
    code TEXT PRIMARY KEY, -- TRY, USD, EUR vb.
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan para birimleri
INSERT INTO currencies (code, name, symbol) VALUES
    ('TRY', 'Turkish Lira', '₺'),
    ('USD', 'US Dollar', '$'),
    ('EUR', 'Euro', '€'),
    ('GBP', 'British Pound', '£'),
    ('JPY', 'Japanese Yen', '¥');

-- RLS for currencies (herkes okuyabilir)
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view currencies" ON currencies
    FOR SELECT USING (true);

-- =====================================================
-- 3. HESAP TİPLERİ
-- =====================================================

CREATE TABLE account_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO account_types (name) VALUES
    ('Normal Hesap'),
    ('Kredi Kartı');

-- RLS for account_types
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view account types" ON account_types
    FOR SELECT USING (true);

-- =====================================================
-- 4. HESAPLAR
-- =====================================================

CREATE TABLE accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_type_id UUID REFERENCES account_types(id) NOT NULL,
    name TEXT NOT NULL,
    currency_code TEXT REFERENCES currencies(code) NOT NULL,
    initial_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    color TEXT, -- Hex color code
    icon TEXT, -- Icon name from mobile library
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. KATEGORİLER
-- =====================================================

CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL ise sistem kategorisi
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE, -- Alt kategori için
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT,
    icon TEXT,
    is_system BOOLEAN DEFAULT false, -- Sistem kategorisi mi?
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan gelir kategorileri
INSERT INTO categories (name, type, is_system, icon, color) VALUES
    ('Maaş', 'income', true, 'briefcase', '#4CAF50'),
    ('Freelance', 'income', true, 'laptop', '#8BC34A'),
    ('Yatırım', 'income', true, 'trending-up', '#66BB6A'),
    ('Hediye', 'income', true, 'gift', '#81C784'),
    ('Diğer Gelir', 'income', true, 'plus-circle', '#A5D6A7');

-- Varsayılan gider kategorileri
INSERT INTO categories (name, type, is_system, icon, color) VALUES
    ('Gıda', 'expense', true, 'shopping-cart', '#F44336'),
    ('Ulaşım', 'expense', true, 'car', '#E91E63'),
    ('Kıyafet', 'expense', true, 'shopping-bag', '#9C27B0'),
    ('Eğlence', 'expense', true, 'film', '#673AB7'),
    ('Faturalar', 'expense', true, 'file-text', '#3F51B5'),
    ('Sağlık', 'expense', true, 'heart', '#2196F3'),
    ('Eğitim', 'expense', true, 'book', '#03A9F4'),
    ('Kira', 'expense', true, 'home', '#00BCD4'),
    ('Abonelik', 'expense', true, 'repeat', '#009688'),
    ('Diğer Gider', 'expense', true, 'more-horizontal', '#FF5722');

-- RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system and own categories" ON categories
    FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- =====================================================
-- 6. İŞLEM TİPLERİ
-- =====================================================

CREATE TABLE transaction_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO transaction_types (name) VALUES
    ('income'),
    ('expense'),
    ('transfer');

-- RLS for transaction_types
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transaction types" ON transaction_types
    FOR SELECT USING (true);

-- =====================================================
-- 7. İŞLEMLER (TRANSACTIONS)
-- =====================================================

CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type_id UUID REFERENCES transaction_types(id) NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Transfer için
    to_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    transfer_fee DECIMAL(15, 2) DEFAULT 0,

    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    notes TEXT,

    -- Fotoğraf/Fiş
    receipt_url TEXT,

    transaction_date TIMESTAMPTZ NOT NULL,

    -- Tekrar eden işlemden mi oluştu?
    recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CHECK (
        (transaction_type_id IN (SELECT id FROM transaction_types WHERE name = 'transfer') AND to_account_id IS NOT NULL)
        OR
        (transaction_type_id IN (SELECT id FROM transaction_types WHERE name IN ('income', 'expense')) AND to_account_id IS NULL)
    )
);

-- Index for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type_id);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 8. TEKRARLAMA SIKLIĞI
-- =====================================================

CREATE TABLE recurring_frequencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- daily, weekly, monthly, yearly, custom
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO recurring_frequencies (name) VALUES
    ('daily'),
    ('weekly'),
    ('monthly'),
    ('yearly'),
    ('custom');

-- RLS for recurring_frequencies
ALTER TABLE recurring_frequencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view frequencies" ON recurring_frequencies
    FOR SELECT USING (true);

-- =====================================================
-- 9. TEKRAR EDEN İŞLEMLER (ABONELİKLER)
-- =====================================================

CREATE TABLE recurring_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type_id UUID REFERENCES transaction_types(id) NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Transfer için
    to_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    transfer_fee DECIMAL(15, 2) DEFAULT 0,

    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    notes TEXT,

    -- Tekrarlama ayarları
    frequency_id UUID REFERENCES recurring_frequencies(id) NOT NULL,
    custom_interval INTEGER, -- custom için (örn: her 3 günde bir)
    custom_interval_type TEXT CHECK (custom_interval_type IN ('days', 'weeks', 'months', 'years')),

    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ, -- NULL ise süresiz

    next_occurrence TIMESTAMPTZ NOT NULL,

    -- Otomatik işleme al mı yoksa onay mı iste?
    is_automatic BOOLEAN DEFAULT false,

    -- Tutar değişebilir mi?
    is_amount_variable BOOLEAN DEFAULT false,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for recurring_transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring transactions" ON recurring_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions" ON recurring_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions" ON recurring_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions" ON recurring_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 10. BİLDİRİM AYARLARI
-- =====================================================

CREATE TABLE notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

    -- Push bildirimleri aktif mi?
    push_enabled BOOLEAN DEFAULT true,

    -- Uygulama içi bildirimler
    in_app_enabled BOOLEAN DEFAULT true,

    -- Abonelik hatırlatmaları
    recurring_reminders BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00', -- Saat kaçta hatırlatsın

    -- Hatırlatma tekrarı (saat cinsinden)
    reminder_retry_hours INTEGER DEFAULT 24,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 11. BEKLEYEN BİLDİRİMLER
-- =====================================================

CREATE TABLE pending_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE CASCADE NOT NULL,

    scheduled_date TIMESTAMPTZ NOT NULL,
    last_reminder_sent TIMESTAMPTZ,
    reminder_count INTEGER DEFAULT 0,

    is_confirmed BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMPTZ,

    -- Kullanıcı onayladıysa ve tutarı değiştirdiyse
    actual_amount DECIMAL(15, 2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for pending_notifications
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending notifications" ON pending_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pending notifications" ON pending_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- 1. Profil oluşturma trigger (Supabase Auth ile senkronizasyon)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);

    -- Varsayılan bildirim ayarlarını oluştur
    INSERT INTO public.notification_settings (user_id)
    VALUES (new.id);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Hesap bakiyesi güncelleme trigger
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_transaction_type TEXT;
BEGIN
    -- İşlem tipini al
    SELECT tt.name INTO v_transaction_type
    FROM transaction_types tt
    WHERE tt.id = COALESCE(NEW.transaction_type_id, OLD.transaction_type_id);

    -- INSERT işlemi
    IF TG_OP = 'INSERT' THEN
        IF v_transaction_type = 'income' THEN
            -- Gelir: hesaba ekle
            UPDATE accounts SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.account_id;

        ELSIF v_transaction_type = 'expense' THEN
            -- Gider: hesaptan çıkar
            UPDATE accounts SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.account_id;

        ELSIF v_transaction_type = 'transfer' THEN
            -- Transfer: kaynak hesaptan çıkar (tutar + ücret)
            UPDATE accounts SET current_balance = current_balance - (NEW.amount + COALESCE(NEW.transfer_fee, 0))
            WHERE id = NEW.account_id;

            -- Transfer: hedef hesaba ekle
            UPDATE accounts SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.to_account_id;
        END IF;

    -- UPDATE işlemi
    ELSIF TG_OP = 'UPDATE' THEN
        -- Eski işlemi geri al
        IF v_transaction_type = 'income' THEN
            UPDATE accounts SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.account_id;
        ELSIF v_transaction_type = 'expense' THEN
            UPDATE accounts SET current_balance = current_balance + OLD.amount
            WHERE id = OLD.account_id;
        ELSIF v_transaction_type = 'transfer' THEN
            UPDATE accounts SET current_balance = current_balance + (OLD.amount + COALESCE(OLD.transfer_fee, 0))
            WHERE id = OLD.account_id;
            UPDATE accounts SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.to_account_id;
        END IF;

        -- Yeni işlemi uygula
        IF v_transaction_type = 'income' THEN
            UPDATE accounts SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.account_id;
        ELSIF v_transaction_type = 'expense' THEN
            UPDATE accounts SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.account_id;
        ELSIF v_transaction_type = 'transfer' THEN
            UPDATE accounts SET current_balance = current_balance - (NEW.amount + COALESCE(NEW.transfer_fee, 0))
            WHERE id = NEW.account_id;
            UPDATE accounts SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.to_account_id;
        END IF;

    -- DELETE işlemi
    ELSIF TG_OP = 'DELETE' THEN
        IF v_transaction_type = 'income' THEN
            UPDATE accounts SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.account_id;
        ELSIF v_transaction_type = 'expense' THEN
            UPDATE accounts SET current_balance = current_balance + OLD.amount
            WHERE id = OLD.account_id;
        ELSIF v_transaction_type = 'transfer' THEN
            UPDATE accounts SET current_balance = current_balance + (OLD.amount + COALESCE(OLD.transfer_fee, 0))
            WHERE id = OLD.account_id;
            UPDATE accounts SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.to_account_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_balance_update
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- 4. Hesap oluşturulduğunda başlangıç bakiyesini current_balance'a ata
CREATE OR REPLACE FUNCTION set_initial_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_balance = NEW.initial_balance;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_initial_balance
    BEFORE INSERT ON accounts
    FOR EACH ROW EXECUTE FUNCTION set_initial_balance();

-- =====================================================
-- YARDIMCI FONKSİYONLAR
-- =====================================================

-- 1. Tekrar eden işlem için sonraki tarihi hesapla
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
    p_current_date TIMESTAMPTZ,
    p_frequency_name TEXT,
    p_custom_interval INTEGER DEFAULT NULL,
    p_custom_interval_type TEXT DEFAULT NULL
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    CASE p_frequency_name
        WHEN 'daily' THEN
            RETURN p_current_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            RETURN p_current_date + INTERVAL '1 week';
        WHEN 'monthly' THEN
            RETURN p_current_date + INTERVAL '1 month';
        WHEN 'yearly' THEN
            RETURN p_current_date + INTERVAL '1 year';
        WHEN 'custom' THEN
            CASE p_custom_interval_type
                WHEN 'days' THEN
                    RETURN p_current_date + (p_custom_interval || ' days')::INTERVAL;
                WHEN 'weeks' THEN
                    RETURN p_current_date + (p_custom_interval || ' weeks')::INTERVAL;
                WHEN 'months' THEN
                    RETURN p_current_date + (p_custom_interval || ' months')::INTERVAL;
                WHEN 'years' THEN
                    RETURN p_current_date + (p_custom_interval || ' years')::INTERVAL;
                ELSE
                    RETURN p_current_date + INTERVAL '1 month';
            END CASE;
        ELSE
            RETURN p_current_date + INTERVAL '1 month';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 2. Bekleyen bildirimleri oluştur (Cron job ile çalıştırılacak)
CREATE OR REPLACE FUNCTION create_pending_notifications()
RETURNS void AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT rt.*, rf.name as frequency_name
        FROM recurring_transactions rt
        JOIN recurring_frequencies rf ON rt.frequency_id = rf.id
        WHERE rt.is_active = true
        AND rt.next_occurrence <= NOW() + INTERVAL '1 day'
        AND (rt.end_date IS NULL OR rt.next_occurrence <= rt.end_date)
        AND NOT EXISTS (
            SELECT 1 FROM pending_notifications pn
            WHERE pn.recurring_transaction_id = rt.id
            AND pn.scheduled_date = rt.next_occurrence
        )
    LOOP
        -- Otomatik işlemse direkt transaction oluştur
        IF rec.is_automatic THEN
            INSERT INTO transactions (
                user_id, transaction_type_id, account_id, category_id,
                to_account_id, transfer_fee, amount, description, notes,
                transaction_date, recurring_transaction_id
            ) VALUES (
                rec.user_id, rec.transaction_type_id, rec.account_id, rec.category_id,
                rec.to_account_id, rec.transfer_fee, rec.amount, rec.description, rec.notes,
                rec.next_occurrence, rec.id
            );

            -- Sonraki occurrence'ı hesapla
            UPDATE recurring_transactions
            SET next_occurrence = calculate_next_occurrence(
                rec.next_occurrence, 
                rec.frequency_name,
                rec.custom_interval,
                rec.custom_interval_type
            )
            WHERE id = rec.id;
        ELSE
            -- Onay gerektiriyorsa pending notification oluştur
            INSERT INTO pending_notifications (
                user_id, recurring_transaction_id, scheduled_date
            ) VALUES (
                rec.user_id, rec.id, rec.next_occurrence
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Onaylanan bildirimi transaction'a çevir
CREATE OR REPLACE FUNCTION confirm_pending_notification(
    p_notification_id UUID,
    p_actual_amount DECIMAL DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_notification RECORD;
    v_recurring RECORD;
    v_frequency_name TEXT;
    v_amount DECIMAL;
BEGIN
    -- Bildirim bilgilerini al
    SELECT * INTO v_notification
    FROM pending_notifications
    WHERE id = p_notification_id;

    -- Recurring transaction bilgilerini al
    SELECT rt.*, rf.name as frequency_name
    INTO v_recurring
    FROM recurring_transactions rt
    JOIN recurring_frequencies rf ON rt.frequency_id = rf.id
    WHERE rt.id = v_notification.recurring_transaction_id;

    -- Tutarı belirle (değişken tutarsa kullanıcının girdiğini al)
    IF p_actual_amount IS NOT NULL THEN
        v_amount := p_actual_amount;
    ELSE
        v_amount := v_recurring.amount;
    END IF;

    -- Transaction oluştur
    INSERT INTO transactions (
        user_id, transaction_type_id, account_id, category_id,
        to_account_id, transfer_fee, amount, description, notes,
        transaction_date, recurring_transaction_id
    ) VALUES (
        v_recurring.user_id, v_recurring.transaction_type_id, v_recurring.account_id, 
        v_recurring.category_id, v_recurring.to_account_id, v_recurring.transfer_fee, 
        v_amount, v_recurring.description, v_recurring.notes,
        v_notification.scheduled_date, v_recurring.id
    );

    -- Bildirimi onayla
    UPDATE pending_notifications
    SET is_confirmed = true,
        confirmed_at = NOW(),
        actual_amount = v_amount
    WHERE id = p_notification_id;

    -- Sonraki occurrence'ı hesapla
    UPDATE recurring_transactions
    SET next_occurrence = calculate_next_occurrence(
        v_recurring.next_occurrence,
        v_recurring.frequency_name,
        v_recurring.custom_interval,
        v_recurring.custom_interval_type
    )
    WHERE id = v_recurring.id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📦 ADIM 2: Supabase Storage Bucket Oluşturma

### 2.1. Bucket Oluşturma

1. Supabase Dashboard'a gidin
2. Sol menüden **Storage** seçin
3. **New Bucket** butonuna tıklayın
4. Aşağıdaki ayarları yapın:
   - **Name**: `receipts`
   - **Public bucket**: ❌ (KAPALI - sadece kullanıcılar kendi dosyalarını görebilsin)
   - **File size limit**: 5MB (isteğe göre ayarlayın)
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, image/webp`

5. **Create bucket** butonuna tıklayın

### 2.2. Storage Policies (RLS)

Bucket oluşturduktan sonra, Supabase Dashboard > Storage > receipts > Policies bölümünde aşağıdaki politikaları ekleyin:

**VEYA**

SQL Editor'da aşağıdaki kodu çalıştırın:

```sql
-- Kullanıcılar kendi klasörlerine dosya yükleyebilir
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını görüntüleyebilir
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2.3. Dosya Yükleme Yapısı

Dosyalar şu formatta saklanacak:
```
receipts/
  └── {user_id}/
      └── {transaction_id}_{timestamp}.jpg
```

Örnek:
```
receipts/550e8400-e29b-41d4-a716-446655440000/abc123_1704211200000.jpg
```

---

## 📦 ADIM 3: Cron Job Kurulumu (Otomatik Bildirimler İçin)

### 3.1. pg_cron Extension'ı Aktifleştirme

Supabase Dashboard > Database > Extensions bölümünden `pg_cron` extension'ını aktifleştirin.

**VEYA**

SQL Editor'da çalıştırın:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 3.2. Cron Job Oluşturma

```sql
-- Her gün saat 00:00'da tekrar eden bildirimleri kontrol et
SELECT cron.schedule(
    'create-recurring-notifications',
    '0 0 * * *', -- Her gün gece yarısı (UTC)
    $$SELECT create_pending_notifications()$$
);

-- Cron job'ı kontrol etme
SELECT * FROM cron.job;

-- Cron job'ı silme (gerekirse)
-- SELECT cron.unschedule('create-recurring-notifications');
```

**NOT**: Cron job UTC timezone'unda çalışır. Eğer farklı bir saatte çalışmasını istiyorsanız cron ifadesini değiştirin.

---

## 📦 ADIM 4: Supabase Authentication Ayarları

### 4.1. Email Provider Yapılandırması

1. Supabase Dashboard > Authentication > Providers
2. **Email** provider'ı aktif edin
3. Ayarlar:
   - **Enable Email provider**: ✅
   - **Confirm email**: ✅ (Email doğrulaması isteniyorsa)
   - **Secure email change**: ✅

### 4.2. Email Templates (Opsiyonel)

Authentication > Email Templates bölümünden email şablonlarını özelleştirebilirsiniz:
- Confirmation email
- Magic link
- Change email address
- Reset password

---

## 📊 ADIM 5: Realtime Ayarları (Opsiyonel)

Anlık güncellemeler için Realtime'ı aktifleştirin:

1. Supabase Dashboard > Database > Replication
2. İzlemek istediğiniz tabloları ekleyin:
   - `transactions`
   - `accounts`
   - `pending_notifications`
   - `recurring_transactions`

**VEYA** SQL ile:

```sql
-- Realtime için publication oluşturma
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_transactions;
```

---

## 🔧 ADIM 6: Döviz Kuru Entegrasyonu

Döviz kurları için [Exchange Rate API](https://github.com/fawazahmed0/exchange-api) kullanılacak.

### API Kullanımı

**Endpoint**: 
```
https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base_currency}.json
```

**Örnek**:
```
https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/try.json
```

### Frontend'de Kullanım (React Native)

```javascript
// lib/exchangeRate.js
export async function getExchangeRate(baseCurrency = 'try') {
  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency.toLowerCase()}.json`
  );
  const data = await response.json();
  return data[baseCurrency.toLowerCase()];
}

// Kullanım
const rates = await getExchangeRate('try');
console.log(rates.usd); // TRY to USD kuru
console.log(rates.eur); // TRY to EUR kuru
```

### Opsiyonel: Exchange Rates Tablosu (Cache İçin)

Eğer kurları veritabanında saklamak isterseniz:

```sql
CREATE TABLE exchange_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    base_currency TEXT REFERENCES currencies(code) NOT NULL,
    target_currency TEXT REFERENCES currencies(code) NOT NULL,
    rate DECIMAL(18, 8) NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, fetched_at::date)
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(fetched_at);
```

---

## 📱 ADIM 7: Frontend Entegrasyonu

### 7.1. Supabase Client Kurulumu

```bash
npm install @supabase/supabase-js
```

### 7.2. Supabase Client Yapılandırması

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 7.3. .env Dosyası

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 7.4. Örnek API Çağrıları

#### Hesap Oluşturma
```javascript
const { data, error } = await supabase
  .from('accounts')
  .insert({
    account_type_id: accountTypeId,
    name: 'Yapı Kredi',
    currency_code: 'TRY',
    initial_balance: 5000.00,
    color: '#FF6B6B',
    icon: 'credit-card'
  })
  .select()
  .single();
```

#### Gider Ekleme
```javascript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    transaction_type_id: expenseTypeId,
    account_id: accountId,
    category_id: categoryId,
    amount: 300.00,
    description: 'Enparada kıyafet alışverişi',
    transaction_date: new Date().toISOString()
  })
  .select()
  .single();
```

#### Transfer İşlemi
```javascript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    transaction_type_id: transferTypeId,
    account_id: sourceAccountId,
    to_account_id: targetAccountId,
    amount: 1000.00,
    transfer_fee: 5.00,
    description: 'Hesaplar arası transfer',
    transaction_date: new Date().toISOString()
  })
  .select()
  .single();
```

#### Abonelik Oluşturma
```javascript
const { data, error } = await supabase
  .from('recurring_transactions')
  .insert({
    transaction_type_id: expenseTypeId,
    account_id: accountId,
    category_id: subscriptionCategoryId,
    amount: 49.99,
    description: 'Netflix aboneliği',
    frequency_id: monthlyFrequencyId,
    start_date: new Date().toISOString(),
    next_occurrence: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_automatic: false,
    is_amount_variable: false
  })
  .select()
  .single();
```

#### Bekleyen Bildirimi Onaylama
```javascript
const { error } = await supabase.rpc('confirm_pending_notification', {
  p_notification_id: notificationId,
  p_actual_amount: 59.99 // Tutar değiştiysе
});
```

#### Fiş/Fotoğraf Yükleme
```javascript
// Dosya yükleme
const file = {
  uri: imageUri,
  type: 'image/jpeg',
  name: `${transactionId}_${Date.now()}.jpg`
};

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('receipts')
  .upload(`${userId}/${file.name}`, file);

if (!uploadError) {
  // Public URL al
  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(`${userId}/${file.name}`);

  // Transaction'a ekle
  await supabase
    .from('transactions')
    .update({ receipt_url: publicUrl })
    .eq('id', transactionId);
}
```

#### Aylık Rapor
```javascript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    amount,
    categories(name),
    transaction_types(name)
  `)
  .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  .in('transaction_types.name', ['income', 'expense']);

// Gruplandırma
const report = data.reduce((acc, item) => {
  const type = item.transaction_types.name;
  const category = item.categories?.name || 'Uncategorized';

  if (!acc[type]) acc[type] = {};
  if (!acc[type][category]) acc[type][category] = 0;

  acc[type][category] += parseFloat(item.amount);
  return acc;
}, {});
```

---

## 📊 Veritabanı İlişkileri (ER Diagram)

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:N)
accounts ──────┐
    ↓ (1:N)    │
transactions   │ (FK: to_account_id)
    ↑          │
    └──────────┘

categories (parent_id: self-referencing)
    ↓ (1:N)
transactions

transaction_types
    ↓ (1:N)
transactions

recurring_transactions
    ↓ (1:N)
pending_notifications
    ↓ (onaylama)
transactions (recurring_transaction_id FK)
```

---

## 🔐 Güvenlik Notları

1. **RLS (Row Level Security)**: Tüm tablolarda etkin, kullanıcılar sadece kendi verilerini görüyor
2. **Trigger'lar**: SECURITY DEFINER ile çalışıyor, güvenli şekilde veri manipülasyonu
3. **Storage**: Private bucket, dosya erişimi RLS ile korunuyor
4. **Hard Delete**: Veriler geri getirilemez, dikkatli kullanılmalı
5. **Foreign Key Cascades**: Hesap silindiğinde ilgili transactions da siliniyor

---

## 📝 Önemli Kurallar ve Kısıtlamalar

### Transfer İşlemleri
- Transfer ÜCRETİ kaynak hesaptan kesilir
- Transfer işlemleri gelir/gider hesabına dahil EDİLMEZ
- `to_account_id` alanı sadece transfer tipinde dolu olabilir

### Kategoriler
- Sistem kategorileri (`is_system = true`) silinemez ve düzenlenemez
- Kullanıcı kategorileri sınırsız alt kategori içerebilir
- Alt kategori oluştururken `parent_id` set edilir

### Tekrar Eden İşlemler
- `is_automatic = true` ise direkt transaction oluşturulur
- `is_automatic = false` ise pending notification oluşturulur
- `is_amount_variable = true` ise kullanıcı tutarı değiştirebilir
- `end_date` NULL ise süresiz devam eder

### Bakiye Hesaplama
- Hesap bakiyesi TRIGGER ile otomatik güncellenir
- Manuel bakiye değiştirme YAPILMAMALI (trigger bozulur)
- Initial balance sadece hesap oluşturulurken set edilir

---

## 🧪 Test Senaryoları

### 1. Yeni Kullanıcı Kaydı
```sql
-- Kullanıcı oluşturulduğunda profil ve notification_settings otomatik oluşturulmalı
SELECT * FROM profiles WHERE id = 'user-uuid';
SELECT * FROM notification_settings WHERE user_id = 'user-uuid';
```

### 2. Hesap Bakiyesi Testi
```sql
-- Hesap oluştur
INSERT INTO accounts (user_id, account_type_id, name, currency_code, initial_balance)
VALUES ('user-uuid', 'type-uuid', 'Test Hesap', 'TRY', 1000);

-- Gelir ekle (bakiye 1300 olmalı)
INSERT INTO transactions (user_id, transaction_type_id, account_id, amount, transaction_date)
VALUES ('user-uuid', 'income-type-uuid', 'account-uuid', 300, NOW());

-- Gider ekle (bakiye 1100 olmalı)
INSERT INTO transactions (user_id, transaction_type_id, account_id, amount, transaction_date)
VALUES ('user-uuid', 'expense-type-uuid', 'account-uuid', 200, NOW());

-- Bakiyeyi kontrol et
SELECT current_balance FROM accounts WHERE id = 'account-uuid'; -- 1100 olmalı
```

### 3. Transfer Testi
```sql
-- İki hesap oluştur
-- Hesap A: 1000 TL
-- Hesap B: 500 TL

-- A'dan B'ye 200 TL transfer (5 TL ücretli)
-- A bakiyesi: 795 (1000 - 200 - 5)
-- B bakiyesi: 700 (500 + 200)
```

### 4. Abonelik Testi
```sql
-- Aylık abonelik oluştur
INSERT INTO recurring_transactions (
    user_id, transaction_type_id, account_id, amount,
    frequency_id, start_date, next_occurrence, is_automatic
) VALUES (
    'user-uuid', 'expense-type-uuid', 'account-uuid', 49.99,
    'monthly-freq-uuid', NOW(), NOW() + INTERVAL '1 month', false
);

-- Pending notification oluştur
SELECT create_pending_notifications();

-- Pending notification kontrol et
SELECT * FROM pending_notifications WHERE user_id = 'user-uuid';

-- Onayla
SELECT confirm_pending_notification('notification-uuid', NULL);

-- Transaction oluşturulduğunu ve next_occurrence'ın güncellendiğini kontrol et
```

---

## 📋 Checklist (Kurulum Sonrası)

- [ ] SQL kodları Supabase'de çalıştırıldı
- [ ] `receipts` bucket'ı oluşturuldu
- [ ] Storage policies (RLS) eklendi
- [ ] pg_cron extension aktifleştirildi
- [ ] Cron job oluşturuldu (`create-recurring-notifications`)
- [ ] Email authentication aktif
- [ ] Realtime ayarlandı (opsiyonel)
- [ ] Frontend'de Supabase client yapılandırıldı
- [ ] .env dosyası düzenlendi
- [ ] Test kullanıcısı oluşturuldu
- [ ] Örnek işlemler test edildi

---

## 🔄 Güncellemeler ve Bakım

### Schema Değişiklikleri

Şema değişikliği yaparken:
1. Migration dosyası oluşturun
2. RLS politikalarını güncelleyin
3. Trigger'ları kontrol edin
4. Frontend API çağrılarını güncelleyin

### Backup

Supabase otomatik backup alır, ancak kritik işlemler öncesi manuel backup alın:
- Dashboard > Database > Backups

### Monitoring

İzlenmesi gerekenler:
- Cron job çalışma durumu: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
- Pending notifications: `SELECT COUNT(*) FROM pending_notifications WHERE is_confirmed = false;`
- Aktif abonelikler: `SELECT COUNT(*) FROM recurring_transactions WHERE is_active = true;`

---

## 🆘 Sorun Giderme

### Trigger Çalışmıyor
```sql
-- Trigger'ları listele
SELECT * FROM information_schema.triggers;

-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS trigger_name ON table_name;
-- Sonra trigger kodunu tekrar çalıştır
```

### RLS Erişim Hatası
```sql
-- Politikaları kontrol et
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Kullanıcının kimliğini kontrol et
SELECT auth.uid();
```

### Cron Job Çalışmıyor
```sql
-- Job detaylarını kontrol et
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'create-recurring-notifications')
ORDER BY start_time DESC;

-- Job'ı manuel çalıştır
SELECT create_pending_notifications();
```

---

## 📞 Ek Kaynaklar

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Exchange Rate API](https://github.com/fawazahmed0/exchange-api)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

---

## ✅ Sonuç

Bu PRD dokümanı, finans takip uygulamanızın Supabase backend altyapısını eksiksiz bir şekilde kurmak için gereken tüm adımları içermektedir. Tüm SQL kodlarını, ayarları ve yapılandırmaları içerdiği için bir AI aracı (Claude, GPT vb.) bu dokümanı kullanarak MCP ile veritabanınızı otomatik olarak oluşturabilir.

**Versiyon**: 1.0  
**Son Güncelleme**: 2 Ocak 2026  
**Durum**: Production Ready
