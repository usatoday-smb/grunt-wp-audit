#!/bin/bash

# Installs PHP dependencies.

if ! hash php 2>/dev/null; then
	echo 'PHP not installed! Aborting.'
	exit 1
else
	echo 'PHP installed.'
fi

echo 'Making php directory.'
if [ -z "$DRY_RUN" ]; then
	mkdir php
fi

PHPCS_URL='https://squizlabs.github.io/PHP_CodeSniffer/phpcs.phar'
echo 'Downloading PHPCS.'
if [ -z "$DRY_RUN" ]; then
	curl -o php/phpcs $PHPCS_URL
else
	echo "Downloaded PHPCS to ${pwd}/php/phpcs."
fi

WPCS_URL='https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards.git'
echo 'Downloading WPCS.'
if [ -z "$DRY_RUN" ]; then
	git clone -b master $WPCS_URL php/wpcs
else
	echo "Cloned WP standards into ${pwd}/php/wpcs."
fi

echo 'Configuring PHPCS to use the WP standard.'
if [ -z "$DRY_RUN" ]; then
	php php/phpcs --config-set installed_paths ${pwd}/php/wpcs
fi

echo 'Done!'
