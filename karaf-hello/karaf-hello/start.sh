#!/bin/bash

# Clean stale data (optional)
rm -rf /opt/apache-karaf/apache-karaf-4.4.6/data/*

# Start Karaf in the background
/opt/apache-karaf/apache-karaf-4.4.6/bin/karaf &

# Wait for Karaf to initialize
sleep 10

# Use Karaf client to install and start your application
/opt/apache-karaf/apache-karaf-4.4.6/bin/client -u karaf -p karaf "bundle:install -s /path/to/your/app.jar"
/opt/apache-karaf/apache-karaf-4.4.6/bin/client -u karaf -p karaf "feature:install your-feature-name"

# Keep the script running (if needed)
wait
