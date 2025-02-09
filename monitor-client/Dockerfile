FROM python:3.10

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y docker.io
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && \
    apt-get install -y wget gnupg apt-transport-https ca-certificates

# Add the Trivy repository public key and convert it with gpg
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | \
    gpg --dearmor | \
    tee /usr/share/keyrings/trivy.gpg > /dev/null

# Add the Trivy repository to the apt sources list
RUN echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | \
    tee /etc/apt/sources.list.d/trivy.list

# Update package list and install Trivy
RUN apt-get update && \
    apt-get install -y trivy

COPY . .

EXPOSE 3000

CMD ["python3", "app.py"]
