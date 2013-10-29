#!/usr/bin/ruby

# usage:
# from package root, do:
#   tasks/release/docs.rb  x.x.x
# where "x.x.x" is the version number

require 'rubygems'
require 'tmpdir'
require 'fileutils'
require 'open3'

unless File.exists?('bower.json') && File.exists?('Gruntfile.js')
  raise "release/docs must be run from package root"
end

def run(cmd, &on_error)
  puts cmd
  stdin, stdout, stderr = Open3.popen3(cmd)
  err_message = stderr.read
  puts "1 #{err_message} - #{cmd}"
  unless err_message == ""
    puts "2 #{err_message} - #{cmd}"
    if block_given?
      yield(err_message)
    else
      puts "3 #{err_message} - #{cmd}"
      exit
    end
  end
  puts "4 #{err_message} - #{cmd}"
  stdout.read
end

orig_working_dir = Dir.pwd

version = ENV['version'] || ARGV[0]

run("grunt groc")

Dir.mktmpdir do |tmpdir| 
  
  # copy the docs to a temporary location
  tmp_doc_dir = "#{tmpdir}/doc"
  FileUtils.cp_r('doc', tmp_doc_dir)
  
  # fetch all branches
  run("git fetch origin")
  
  # switch to gh-pages branch
  run("git checkout -b gh-pages origin/gh-pages") do |err_message|
    if err_message.match(/A branch named 'gh-pages' already exists/)
      puts "runnit"
      run("git checkout gh-pages")
      puts "done1"
    else
      puts err_message
      exit
    end   
    puts "done2" 
  end
  puts "done3"
  
  
  # copy the docs to the right place an add a link to the index file
  puts "copy #{tmp_doc_dir} to docs/#{version}"
  # FileUtils.mv(tmp_doc_dir, "docs/#{version}")
  # File.open("index.html", "a+") do |f|
  #   f.write(%q|\n<a href="docs/#{version}">Version #{version}</a>\n|)
  # end
end