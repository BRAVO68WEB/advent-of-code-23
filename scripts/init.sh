#!/bin/bash
day=$(date +%d)
# echo $day
cd ../../ts && mkdir -p $day && cd $day && bun init -y