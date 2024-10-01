#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from "fs";
import table from "cli-table3";
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';

const program = new Command();
const filepath = './data-courses.json';
const questionsForAdd = [
  {
    type: "input",
    name: "courseName",
    message: "Please Enter Course Title : ",
  },
  {
    type: "input",
    name: "coursePrice",
    message: "Please Enter Course price : ",
  }
];
const questionsForSearch =[
    {
        type: "input",
        name: "Name",
        message: "Please Enter Course Name Or Title",
      }
]
const questionsForDelete =[
    {
        type: "input",
        name: "Name",
        message: "What is the name of the course?",
      }
]
const questionsForupdate =[
      {
        type: "input",
        name: "courseName",
        message: "What is the name of the course?",
      }, 
      {
        type: "number",
        name: "coursePrice",
        message: "What is the new price updated of the course?",
      }
]
const questionsForsort =[
  {
        type: "input",
        name: "name_sort",
        message: "Do you want to sort using Name or Price ?",
  }
]
program
  .name('Courses-Manger')
  .description('CLI to help manage courses')
  .version('1.0.1');

program
  .command("add")
  .alias("a")
  .description("Add a Course")
  .action(async() => {
    const rainbowAdd = chalkAnimation.rainbow('ENTER COURSE DETAILS...')
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        rainbowAdd.stop(); 
        resolve();
      }, 500);
    }).then(()=>{             
    inquirer
    .prompt(questionsForAdd)
    .then((answers) => {
        if (fs.existsSync(filepath)) {
            if (answers.courseName.trim() === "" || answers.coursePrice === "") {
              console.log(chalk.red.bold("Error: Course name or price cannot be empty!"));
              return;
            }
            if (isNaN(answers.coursePrice)) {
              console.log(chalk.red.bold("Error: Price must be a number!"));
              return;
            }
            const read_file = fs.readFileSync(filepath, "utf-8");
            const filecontentAsJson = JSON.parse(read_file);
            const existingCourse = filecontentAsJson.find(course =>
               answers.courseName.replace(/\s+/g, '').trim().toLowerCase() === course.courseName.replace(/\s+/g, '').trim().toLowerCase()
            )
            if(!existingCourse){
              filecontentAsJson.push(answers);  // push new course to existing courses
              fs.writeFile(filepath, JSON.stringify(filecontentAsJson), "utf-8", () => {
                console.log(chalk.green.bold('Course Added Successfully'));
              });
            } else{
              console.log(chalk.red.bold(`This course exists`))
            }
            
        } else {
            fs.writeFile(filepath, JSON.stringify([answers]), "utf-8", () => {
              console.log(chalk.green.bold('Course Added Successfully'));
          });
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error.message);
        process.exit(1);
      });
    })
  });

program
  .command("list")
  .alias("l")
  .description("Show all Courses")
  .action(() => {
    if (fs.existsSync(filepath)) {
      fs.readFile(filepath, "utf-8", (err, content) => {
        if (err) {
          console.error("Error reading file:", err.message);
          process.exit(1);
        }
        const contentASJson = JSON.parse(content);
        const tab = new table({
          head: ['Course Name', 'Course Price']
        });
        contentASJson.forEach(course => {
          tab.push([course.courseName, course.coursePrice]);
        });

        console.log(tab.toString());
      });
    } else {
      console.log("No courses found. Please add a course first.");
    }
  });

program
  .command("search ")
  .alias("s")
  .description("Search for a course by name")
  .action(() => {
    inquirer
    .prompt(questionsForSearch)
    .then((answers) => {
        if (fs.existsSync(filepath)){
            let read_file = fs.readFileSync(filepath,'utf-8');
            let contentASJson = JSON.parse(read_file);
            let FilterContent = contentASJson.filter((course)=>{
                return answers.Name.replace(/\s+/g, '').trim().toLowerCase() === course.courseName.replace(/\s+/g, '').trim().toLowerCase();
            })
            if (FilterContent == "") {
                console.log(chalk.red.bold(`No course found with name:`) + `${answers.Name}`);
            } else{
              const tab = new table({
                head: ['Course Name', 'Course Price']
              });
              FilterContent.forEach(course => {
                tab.push([course.courseName, course.coursePrice]);
              });
              console.log(tab.toString());
            }
        } else {
        console.log(chalk.red.bold("No courses found. Please add a course first."));
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
      process.exit(1);
    });
  })

program
.command("delete")
.alias("d")
.description("Delete a course by name")
  .action(() => {
    inquirer
    .prompt(questionsForDelete)
    .then((answers) => {
        if (fs.existsSync(filepath)){
            let read_file = fs.readFileSync(filepath,'utf-8');
            let contentASJson = JSON.parse(read_file);
            let FilterContent = contentASJson.filter((course)=>{
                return answers.Name.replace(/\s+/g, '').trim().toLowerCase() != course.courseName.replace(/\s+/g, '').trim().toLowerCase();
            })
            if (FilterContent.length == contentASJson.length) {
              console.log(chalk.red.bold(`No course found with name:`) + `${answers.Name}`);
            } else{
                fs.writeFile(filepath,JSON.stringify(FilterContent),()=>{
                    console.log(chalk.greenBright.bold(`Course "${answers.Name}" deleted successfully!`));
                })
            }
        } else {
          console.log(chalk.red.bold("No courses found. Please add a course first."));
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
      process.exit(1);
    });
  })    


program
  .command("count")
  .alias("c")
  .description("Show total number of courses")
  .action(() => {
    if (fs.existsSync(filepath)) {
      fs.readFile(filepath, "utf-8", (err, content) => {
        if (err) {
          console.error("Error reading file:", err.message);
          process.exit(1);
        }
        const courses = JSON.parse(content);
        console.log(chalk.redBright.bold(`Total number of courses: `) + `${courses.length}`);
      });
    } else {
        console.log(chalk.red.bold("No courses found. Please add a course first."));
    }
  });
  
program
  .command("update")
  .alias("u")
  .description(" Update a course by price ")
  .action(()=>{
    inquirer
    .prompt(questionsForupdate)
    .then((answers)=>{
        if (fs.existsSync(filepath)){
            let read_file = fs.readFileSync(filepath,'utf-8');
            let contentASJson = JSON.parse(read_file);
            let FilterContent = contentASJson.filter((course)=>{
                return answers.courseName.replace(/\s+/g, '').trim().toLowerCase() != course.courseName.replace(/\s+/g, '').trim().toLowerCase();
            })
            if (FilterContent.length == contentASJson.length) {
              console.log(chalk.red.bold(`No course found with name:`) + ` "${answers.courseName}"`);
            } else{
                FilterContent.push(answers);  // push new course to existing courses
                fs.writeFile(filepath, JSON.stringify(FilterContent), "utf-8", () => {
                console.log(chalk.greenBright.bold("Course update successfully!"));
          });
            }
        } else {
          console.log(chalk.red.bold("No courses found. Please add a course first."));
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
      process.exit(1);
    });
  })
  
program 
.command("sort")
.alias("sr")
.description("Sort courses by 'name' or 'price'")
.action(()=>{
  inquirer
  .prompt(questionsForsort)
  .then((answers)=>{
      if(fs.existsSync(filepath)){
        const read_file = fs.readFileSync(filepath,"utf-8")
        const contentASJson = JSON.parse(read_file)

        if(answers.name_sort.toLowerCase() === "name"){
            contentASJson.sort((a,b)=> a.courseName.localeCompare(b.courseName,{ sensitivity: 'base' }))
        } else if(answers.name_sort.toLowerCase() === "price"){
            contentASJson.sort((a,b)=> b.coursePrice - a.coursePrice )
        } else {
            console.log(chalk.red.bold("Invalid answers.") + `Please use 'name' or 'price'.`);
            return;
        }

        const tab = new table({
          head: ['Course Name', 'Course Price']
        });
        contentASJson.forEach(course => {
          tab.push([course.courseName, course.coursePrice]);
        });
        console.log(tab.toString());
      } else {
        console.log(chalk.red.bold("No courses found. Please add a course first."));
      }
  })

})
program.parse();


 