let utils = require('./utils');
require('dotenv').config();

/**
 * Creates an xml string following the standards of the salesforce package.xml files
 * used for metadata deployments. 
 */
function createPackageXml(entryPoint,dependencies){

    let depsByType = new Map();

    dependencies = dependencies.filter(dep => !utils.isDynamicReference(dep));

    dependencies.push(entryPoint);

    dependencies.forEach(dep => {

        if(depsByType.has(dep.type)){
            depsByType.get(dep.type).add(dep.name);
        }
        else{
            depsByType.set(dep.type,new Set());
            depsByType.get(dep.type).add(dep.name);
        }
    });

    let xmlTop = `<?xml version="1.0" encoding="UTF-8"?>
    <Package xmlns="http://soap.sforce.com/2006/04/metadata">`;

    let typesXml = '';

    for(let [type,members] of depsByType){

        let xmlAllMembers = '';

        if(members.size > 0){

            let membersArray = Array.from(members);
            membersArray.sort();

            membersArray.forEach(m => {

                let xmlMember = `<members>${m}</members>`
                xmlAllMembers += xmlMember;
    
            });
    
            xmlAllMembers += `<name>${type}</name>`
    
            let xmlTypeMembers = `<types>${xmlAllMembers}</types>`;
            typesXml += xmlTypeMembers;
        } 
    }

    let xmlBotton = `<version>${process.env.sfApiVersion}</version>
    </Package>`

    let allXml = xmlTop+typesXml+xmlBotton;

    return allXml;
}

module.exports = createPackageXml;
