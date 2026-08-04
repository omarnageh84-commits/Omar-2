function doPost(e){
  try{
    let data = JSON.parse(e.postData.contents);
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let maps = [
      {key:'expenses', name:'مصروفاتي'},
      {key:'debts', name:'ديوني'},
      {key:'attendance', name:'الحضور'},
      {key:'notes', name:'ملاحظاتي'}
    ];
    maps.forEach(m=>{
      if(data[m.key] && data[m.key].length>0){
        let sh = ss.getSheetByName(m.name) || ss.insertSheet(m.name);
        sh.clear();
        let headers = Object.keys(data[m.key][0]);
        sh.getRange(1,1,1,headers.length).setValues([headers]);
        let rows = data[m.key].map(o=>headers.map(h=>o[h]!==undefined?o[h]:''));
        sh.getRange(2,1,rows.length, headers.length).setValues(rows);
      }
    });
    return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet(){
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let result={};
  let maps = [
    {key:'expenses', name:'مصروفاتي'},
    {key:'debts', name:'ديوني'},
    {key:'attendance', name:'الحضور'},
    {key:'notes', name:'ملاحظاتي'}
  ];
  maps.forEach(m=>{
    let sh = ss.getSheetByName(m.name);
    if(sh && sh.getLastRow()>1){
      let values = sh.getDataRange().getValues();
      let headers=values[0];
      result[m.key]=values.slice(1).map(r=>{let o={}; headers.forEach((h,i)=>o[h]=r[i]); return o;});
    }
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
