#!/bin/bash
# deployment/setup.sh

# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Caddy kurulumu
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# PM2 kurulumu
sudo npm install -g pm2

# Log dizinleri oluşturma
sudo mkdir -p /var/log/caddy
sudo mkdir -p /var/log/pm2
sudo chown -R caddy:caddy /var/log/caddy
sudo chown -R $USER:$USER /var/log/pm2

# Caddy konfigürasyonunu kopyala
sudo cp deployment/Caddyfile /etc/caddy/Caddyfile

# Caddy'yi yeniden başlat
sudo systemctl restart caddy

# Uygulamayı PM2 ile başlat
pm2 start deployment/ecosystem.config.js

# PM2'yi sistem başlangıcında otomatik başlatma
pm2 startup
pm2 save

echo "Setup completed successfully!"