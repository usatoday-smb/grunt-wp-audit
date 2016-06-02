#!/bin/bash

# Installs PHP dependencies.

if ! hash php 2>/dev/null; then
	echo 'PHP not installed! Aborting.'
	exit 1
else
	echo 'PHP installed.'
fi

DIR="$(pwd)/php"

echo 'Making php directory.'
if [ -z "$DRY_RUN" -a ! -d $DIR ]; then
	mkdir $DIR
fi

PHPCS_URL='https://squizlabs.github.io/PHP_CodeSniffer/phpcs.phar'
echo 'Downloading PHPCS.'
if [ -z "$DRY_RUN" -a ! -r $DIR/phpcs ]; then
	curl -o $DIR/phpcs $PHPCS_URL
	chmod +x $DIR/phpcs
elif [ -n "$DRY_RUN" ]; then
	echo "Downloaded PHPCS to $DIR/phpcs."
fi

WPCS_URL='https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards.git'
echo 'Downloading WPCS.'
if [ -z "$DRY_RUN" -a ! -d $DIR/wpcs ]; then
	git clone -b master $WPCS_URL $DIR/wpcs
else
	echo "Cloned WP standards into $DIR/wpcs."
fi

echo 'Configuring PHPCS to use the WP standard.'
if [ -z "$DRY_RUN" ]; then
	php php/phpcs --config-set installed_paths $DIR/wpcs
	php php/phpcs --config-set ignore_errors_on_exit 1
	php php/phpcs --config-set ignore_warnings_on_exit 1
fi

echo 'Done!'
