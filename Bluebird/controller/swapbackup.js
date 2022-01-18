// swap funcation..
exports.swapMealFood = async function(req) {
   try {
 
     var usermealId = req.body.usermealId;
     var foodId = req.body.foodId;
     var mealno = req.body.mealno;
     var diettype = req.body.diettype;
     var foodposition = req.body.foodposition;
     var filterCategory;
     var MealFood = await query.findOne(usermealcoll, { _id : usermealId });
     if(mealno == 1){
       if(foodposition == 0){
         filterCategory = MealFood.meal10
       }
       if(foodposition == 1){
         filterCategory = MealFood.meal11
       }
       if(foodposition == 2){
         filterCategory = MealFood.meal12
       }
       if(foodposition == 3){
         filterCategory = MealFood.meal13
       }
     }
 
     if(mealno == 2){
       if(foodposition == 0){
         filterCategory = MealFood.meal20
       }
       if(foodposition == 1){
         filterCategory = MealFood.meal21
       }
       if(foodposition == 2){
         filterCategory = MealFood.meal22
       }
       if(foodposition == 3){
         filterCategory = MealFood.meal23
       }
     }
 
     if(mealno == 3){
       if(foodposition == 0){
         filterCategory = MealFood.meal30
       }
       if(foodposition == 1){
         filterCategory = MealFood.meal31
       }
       if(foodposition == 2){
         filterCategory = MealFood.meal32
       }
       if(foodposition == 3){
         filterCategory = MealFood.meal33
       }
     }
 
     if(mealno == 4){
       if(foodposition == 0){
         filterCategory = MealFood.meal40
       }
       if(foodposition == 1){
         filterCategory = MealFood.meal41
       }
       if(foodposition == 2){
         filterCategory = MealFood.meal42
       }
       if(foodposition == 3){
         filterCategory = MealFood.meal43
       }
     }
 
     if(mealno == 5){
       if(foodposition == 0){
         filterCategory = MealFood.meal50
       }
       if(foodposition == 1){
         filterCategory = MealFood.meal51
       }
       if(foodposition == 2){
         filterCategory = MealFood.meal52
       }
       if(foodposition == 3){
         filterCategory = MealFood.meal53
       }
     }
 
     if(mealno == 6){
       if(foodposition == 0){
         filterCategory = MealFood.meal60
       }
       if(foodposition == 1){
         filterCategory = MealFood.meal61
       }
       if(foodposition == 2){
         filterCategory = MealFood.meal62
       }
       if(foodposition == 3){
         filterCategory = MealFood.meal63
       }
     }
     var food = await query.findOne(mealcoll, { _id : foodId});
     if(food){
 
       var foodName = food.grocery_list_name;
       var foodCategory = food.category;
       var foodCal = food.cal;
       var foodProt = food.prot;
       var foodCarb = food.carbs;
       var foodFat = food.fats;
       var mealVal;
       var mealCat;
       var extraFilter = {};
       if(foodCategory == "Protein"){
         mealVal = foodProt;
         mealCat = '$prot';
         extraFilter = { cal : { $gte: foodCal } , carbs : { $gte: foodCarb } , fats : { $lte: foodFat } }
       }
       if(foodCategory == "Fats"){
         mealVal = foodFat;
         mealCat = '$fats';
       }
       if(foodCategory == "Carb" || foodCategory == "Carb, Fruit" || foodCategory == "F-Carb"){
         mealVal = foodCarb;
         mealCat = '$carbs';
         extraFilter = { cal : { $gte: foodCal } , carbs : { $gte: foodCarb } , fats : { $lte: foodFat } }
       }
 
       let filter;
       if(diettype == 1){
         filter =  { paleo: { $ne: "FALSE" } }
       }
       else if(diettype == 2){
         filter = { mediterranean: { $ne: "FALSE" } }
       }
       else if(diettype == 3){
        filter = { pescatarian: { $ne: "FALSE" } }
      }
      else if(diettype == 4){
        filter = { vegan: { $ne: "FALSE" } }
      }
       else{
         filter = {}
       }
 
       let dietfilter;
       let checkmeal = 'meal' + mealno
       var dynObj = {};
       dynObj[checkmeal] = "TRUE";
       var idfilter = { _id: { $ne: foodId } }
       var namefilter = { grocery_list_name : { $nin: filterCategory } }
       var catefilter = { category : foodCategory }
       dietfilter = { $and: [ filter , dynObj , idfilter, namefilter, catefilter ]  }
       dietfilter.$and.push(extraFilter)
       // console.log("dietfilter",dietfilter);
       // console.log("dietfilter",JSON.stringify(dietfilter));
       // console.log("mealVal",mealVal);
       // console.log("mealCat",mealCat);
       
       var meal = await UserService.swapmeal(dietfilter, mealVal, mealCat, foodId, foodName, foodCategory);
       
       if(_.isEmpty(meal)){
         //console.log("is empty--");
         var gender = MealFood.usertype;
         var goal = MealFood.usergoal;
         if(gender == "male"){
           //male
 
           if (goal == 3) {
             // goal - 3 (two meal plan)
             var usercalories1 = MealFood.mealplan1;
             var usercalories2 = MealFood.mealplan2;
             var usercarbs = MealFood.carbs;
             var userprotein = MealFood.protein;
             var userfat = MealFood.fat;
             var mealpercentage = MealFood.mealpercentage;
             var mealplantype = MealFood.mealplantype;
   
             var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
             var preparemealplan2 = await UserService.preparemealplan1v2(usercalories2, usercarbs, userprotein, userfat, mealpercentage);
             // console.log("preparemealplan1--",preparemealplan1);
             // console.log("preparemealplan2--",preparemealplan2);
   
             var userdiet = MealFood.diettype;
             let filter;
             if(userdiet == 1){
               filter =  { paleo: { $ne: "FALSE" } }
             }
             else if(userdiet == 2){
               filter = { mediterranean: { $ne: "FALSE" } }
             }
             else if(userdiet == 3){
              filter = { pescatarian: { $ne: "FALSE" } }
            }
            else if(userdiet == 4){
              filter = { vegan: { $ne: "FALSE" } }
            }
             else{
               filter = {}
             }
               let dietfilter;
               var finalarrplan1 = [];
               var finalarrplan2 = [];
               var result = [];
               var dupresult = [];
               const arrplan1 = preparemealplan1;
               const arrplan2 = preparemealplan2;
   
               for (let i = 0; i < arrplan1.length; i++) {
                 let checkmeal = 'meal' + [i+1]
                 var dynObj = {};
                 dynObj[checkmeal] = "TRUE";
   
                 dietfilter = { $and: [ filter , dynObj ] }
                 //  console.log(arrplan1[i].cal);
                 // console.log("dietfilter",dietfilter);
   
                 var category = [
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 ]
   
                   var mealVal = {
                     cal: arrplan1[i].cal,
                     carb: arrplan1[i].carb,
                     protein: arrplan1[i].protein,
                     fat: arrplan1[i].fat,
                   }
   
                   var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                   var finalmeal =  meal;
                   var caloriesfood = finalmeal[0].calories.grocery_list_name;
                   var carbfood = finalmeal[1].carbs.grocery_list_name;
                   var protinfood = finalmeal[2].proteins.grocery_list_name;
                   var fatsfood = finalmeal[3].fats.grocery_list_name;
                   if(checkmeal == 'meal1'){
                     m1meal1 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal2'){
                     m1meal2 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal3'){
                     m1meal3 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal4'){
                     m1meal4 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal5'){
                     m1meal5 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal6'){
                     m1meal6 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   finalarrplan1.push(finalmeal);
   
               }
   
               for (let i = 0; i < arrplan2.length; i++) {
                 let checkmeal = 'meal' + [i+1]
                 var dynObj = {};
                 dynObj[checkmeal] = "TRUE";
   
                 dietfilter = { $and: [ filter , dynObj ] }
                 //  console.log(arrplan2[i].cal);
                 // console.log("dietfilter",dietfilter);
                 var category = [
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 ]
   
                   var mealVal = {
                     cal: arrplan2[i].cal,
                     carb: arrplan2[i].carb,
                     protein: arrplan2[i].protein,
                     fat: arrplan2[i].fat,
                   }
   
                   var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                   var finalmeal =  meal;
                   var caloriesfood = finalmeal[0].calories.grocery_list_name;
                   var carbfood = finalmeal[1].carbs.grocery_list_name;
                   var protinfood = finalmeal[2].proteins.grocery_list_name;
                   var fatsfood = finalmeal[3].fats.grocery_list_name;
                   if(checkmeal == 'meal1'){
                     m2meal1 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal2'){
                     m2meal2 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal3'){
                     m2meal3 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal4'){
                     m2meal4 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal5'){
                     m2meal5 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   if(checkmeal == 'meal6'){
                     m2meal6 = [ caloriesfood , carbfood , protinfood, fatsfood ] 
                   }
                   finalarrplan2.push(finalmeal);
   
               }
 
               if(mealplantype == 1){
                 var fmeal = finalarrplan1;
                 // 3 day finalarrplan1
               }
               else{
                 var fmeal = finalarrplan2;
                 // finalarrplan2
               }
               if(mealno == 1){
                 if(foodposition == 0){
                   var newmeal = fmeal[0][0].calories;
                   var newname = fmeal[0][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal10 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
                   MealFood.mealplan[0][0].calories = newmeal
                   MealFood.mealplan[0][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[0][1].carbs;
                   var newname = fmeal[0][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal11 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
                   MealFood.mealplan[0][1].carbs = newmeal
                   MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[0][2].proteins;
                   var newname = fmeal[0][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal12 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[0][3].fats.prot)
                   MealFood.mealplan[0][2].proteins = newmeal
                   MealFood.mealplan[0][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[0][3].fats;
                   var newname = fmeal[0][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal13 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[0][3].fats = newmeal
                   MealFood.mealplan[0][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 2){
                 if(foodposition == 0){
                   var newmeal = fmeal[1][0].calories;
                   var newname = fmeal[1][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal20 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
                   MealFood.mealplan[1][0].calories = newmeal
                   MealFood.mealplan[1][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[1][1].carbs;
                   var newname = fmeal[1][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal21 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
                   MealFood.mealplan[1][1].carbs = newmeal
                   MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[1][2].proteins;
                   var newname = fmeal[1][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal22 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[1][3].fats.prot)
                   MealFood.mealplan[1][2].proteins = newmeal
                   MealFood.mealplan[1][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[1][3].fats;
                   var newname = fmeal[1][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal23 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[1][3].fats = newmeal
                   MealFood.mealplan[1][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 3){
                 if(foodposition == 0){
                   var newmeal = fmeal[2][0].calories;
                   var newname = fmeal[2][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal30 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
                   MealFood.mealplan[2][0].calories = newmeal
                   MealFood.mealplan[2][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[2][1].carbs;
                   var newname = fmeal[2][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal31 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
                   MealFood.mealplan[2][1].carbs = newmeal
                   MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[2][2].proteins;
                   var newname = fmeal[2][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal32 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[2][3].fats.prot)
                   MealFood.mealplan[2][2].proteins = newmeal
                   MealFood.mealplan[2][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[2][3].fats;
                   var newname = fmeal[2][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal33 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[2][3].fats = newmeal
                   MealFood.mealplan[2][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 4){
                 if(foodposition == 0){
                   var newmeal = fmeal[3][0].calories;
                   var newname = fmeal[3][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal40 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
                   MealFood.mealplan[3][0].calories = newmeal
                   MealFood.mealplan[3][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[3][1].carbs;
                   var newname = fmeal[3][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal41 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
                   MealFood.mealplan[3][1].carbs = newmeal
                   MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[3][2].proteins;
                   var newname = fmeal[3][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal42 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[3][3].fats.prot)
                   MealFood.mealplan[3][2].proteins = newmeal
                   MealFood.mealplan[3][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[3][3].fats;
                   var newname = fmeal[3][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal43 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[3][3].fats = newmeal
                   MealFood.mealplan[3][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 5){
                 if(foodposition == 0){
                   var newmeal = fmeal[4][0].calories;
                   var newname = fmeal[4][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal50 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
                   MealFood.mealplan[4][0].calories = newmeal
                   MealFood.mealplan[4][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[4][1].carbs;
                   var newname = fmeal[4][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal51 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
                   MealFood.mealplan[4][1].carbs = newmeal
                   MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
 
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[4][2].proteins;
                   var newname = fmeal[4][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal52 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[4][3].fats.prot)
                   MealFood.mealplan[4][2].proteins = newmeal
                   MealFood.mealplan[4][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[4][3].fats;
                   var newname = fmeal[4][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal53 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[4][3].fats = newmeal
                   MealFood.mealplan[4][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 6){
                 if(foodposition == 0){
                   var newmeal = fmeal[5][0].calories;
                   var newname = fmeal[5][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal60 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
                   MealFood.mealplan[5][0].calories = newmeal
                   MealFood.mealplan[5][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[5][1].carbs;
                   var newname = fmeal[5][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal61 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
                   MealFood.mealplan[5][1].carbs = newmeal
                   MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[5][2].proteins;
                   var newname = fmeal[5][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal62 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[5][3].fats.prot)
                   MealFood.mealplan[5][2].proteins = newmeal
                   MealFood.mealplan[5][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[5][3].fats;
                   var newname = fmeal[5][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal63 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[5][3].fats = newmeal
                   MealFood.mealplan[5][4].total.totalFats = totalFats
                 }
               }
 
               var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
               //console.log("UpdateMealFood",UpdateMealFood);
               return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
             
           }
           else if (goal == 2) {
             // goal 2 (1 day meal)
             var usercalories1 = MealFood.mealplan1;
             var usercarbs =MealFood.carbs;
             var userprotein =MealFood.protein;
             var userfat =MealFood.fat;
             var mealpercentage = MealFood.mealpercentage;
   
             var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
             //console.log("preparemealplan1",preparemealplan1);
             var userdiet = MealFood.diettype;
             let filter;
             if(userdiet == 1){
               filter =  { paleo: { $ne: "FALSE" } }
             }
             else if(userdiet == 2){
               filter = { mediterranean: { $ne: "FALSE" } }
             }
             else if(userdiet == 3){
              filter = { pescatarian: { $ne: "FALSE" } }
            }
            else if(userdiet == 4){
              filter = { vegan: { $ne: "FALSE" } }
            }
             else{
               filter = {}
             }
   
             let dietfilter;
             var finalarrplan1 = [];
             var result = [];
             const arrplan1 = preparemealplan1;
   
               for (let i = 0; i < arrplan1.length; i++) {
                 let checkmeal = 'meal' + [i+1]
                 var dynObj = {};
                 dynObj[checkmeal] = "TRUE";
   
                 dietfilter = { $and: [ filter , dynObj ] }
                 //  console.log(arrplan1[i].cal);
                 // console.log("dietfilter",dietfilter);
   
                 var category = [
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 ]
   
                   var mealVal = {
                     cal: arrplan1[i].cal,
                     carb: arrplan1[i].carb,
                     protein: arrplan1[i].protein,
                     fat: arrplan1[i].fat,
                   }
   
                   var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                   var finalmeal =  meal
                   finalarrplan1.push(finalmeal);
   
               }
 
               var fmeal = finalarrplan1;
               if(mealno == 1){
                 if(foodposition == 0){
                   var newmeal = fmeal[0][0].calories;
                   var newname = fmeal[0][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal10 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
                   MealFood.mealplan[0][0].calories = newmeal
                   MealFood.mealplan[0][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[0][1].carbs;
                   var newname = fmeal[0][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal11 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
                   MealFood.mealplan[0][1].carbs = newmeal
                   MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[0][2].proteins;
                   var newname = fmeal[0][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal12 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[0][3].fats.prot)
                   MealFood.mealplan[0][2].proteins = newmeal
                   MealFood.mealplan[0][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[0][3].fats;
                   var newname = fmeal[0][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal13 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[0][3].fats = newmeal
                   MealFood.mealplan[0][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 2){
                 if(foodposition == 0){
                   var newmeal = fmeal[1][0].calories;
                   var newname = fmeal[1][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal20 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
                   MealFood.mealplan[1][0].calories = newmeal
                   MealFood.mealplan[1][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[1][1].carbs;
                   var newname = fmeal[1][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal21 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
                   MealFood.mealplan[1][1].carbs = newmeal
                   MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[1][2].proteins;
                   var newname = fmeal[1][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal22 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[1][3].fats.prot)
                   MealFood.mealplan[1][2].proteins = newmeal
                   MealFood.mealplan[1][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[1][3].fats;
                   var newname = fmeal[1][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal23 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[1][3].fats = newmeal
                   MealFood.mealplan[1][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 3){
                 if(foodposition == 0){
                   var newmeal = fmeal[2][0].calories;
                   var newname = fmeal[2][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal30 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
                   MealFood.mealplan[2][0].calories = newmeal
                   MealFood.mealplan[2][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[2][1].carbs;
                   var newname = fmeal[2][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal31 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
                   MealFood.mealplan[2][1].carbs = newmeal
                   MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[2][2].proteins;
                   var newname = fmeal[2][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal32 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[2][3].fats.prot)
                   MealFood.mealplan[2][2].proteins = newmeal
                   MealFood.mealplan[2][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[2][3].fats;
                   var newname = fmeal[2][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal33 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[2][3].fats = newmeal
                   MealFood.mealplan[2][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 4){
                 if(foodposition == 0){
                   var newmeal = fmeal[3][0].calories;
                   var newname = fmeal[3][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal40 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
                   MealFood.mealplan[3][0].calories = newmeal
                   MealFood.mealplan[3][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[3][1].carbs;
                   var newname = fmeal[3][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal41 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
                   MealFood.mealplan[3][1].carbs = newmeal
                   MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[3][2].proteins;
                   var newname = fmeal[3][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal42 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[3][3].fats.prot)
                   MealFood.mealplan[3][2].proteins = newmeal
                   MealFood.mealplan[3][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[3][3].fats;
                   var newname = fmeal[3][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal43 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[3][3].fats = newmeal
                   MealFood.mealplan[3][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 5){
                 if(foodposition == 0){
                   var newmeal = fmeal[4][0].calories;
                   var newname = fmeal[4][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal50 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
                   MealFood.mealplan[4][0].calories = newmeal
                   MealFood.mealplan[4][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[4][1].carbs;
                   var newname = fmeal[4][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal51 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
                   MealFood.mealplan[4][1].carbs = newmeal
                   MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
 
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[4][2].proteins;
                   var newname = fmeal[4][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal52 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[4][3].fats.prot)
                   MealFood.mealplan[4][2].proteins = newmeal
                   MealFood.mealplan[4][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[4][3].fats;
                   var newname = fmeal[4][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal53 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[4][3].fats = newmeal
                   MealFood.mealplan[4][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 6){
                 if(foodposition == 0){
                   var newmeal = fmeal[5][0].calories;
                   var newname = fmeal[5][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal60 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
                   MealFood.mealplan[5][0].calories = newmeal
                   MealFood.mealplan[5][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[5][1].carbs;
                   var newname = fmeal[5][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal61 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
                   MealFood.mealplan[5][1].carbs = newmeal
                   MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[5][2].proteins;
                   var newname = fmeal[5][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal62 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[5][3].fats.prot)
                   MealFood.mealplan[5][2].proteins = newmeal
                   MealFood.mealplan[5][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[5][3].fats;
                   var newname = fmeal[5][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal63 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[5][3].fats = newmeal
                   MealFood.mealplan[5][4].total.totalFats = totalFats
                 }
               }
 
               var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
               //console.log("UpdateMealFood",UpdateMealFood);
               return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
   
           }
           else {
             // goal 1 (1 day meal )
             var usercalories1 = MealFood.mealplan1;
             var usercarbs = MealFood.carbs;
             var userprotein = MealFood.protein;
             var userfat = MealFood.fat;
             var mealpercentage = MealFood.mealpercentage;
   
             var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
             //console.log("preparemealplan1--++",preparemealplan1);
             
             var userdiet = MealFood.diettype;
             let filter;
             if(userdiet == 1){
               filter =  { paleo: { $ne: "FALSE" } }
             }
             else if(userdiet == 2){
               filter = { mediterranean: { $ne: "FALSE" } }
             }
             else if(userdiet == 3){
              filter = { pescatarian: { $ne: "FALSE" } }
            }
            else if(userdiet == 4){
              filter = { vegan: { $ne: "FALSE" } }
            }
             else{
               filter = {}
             }
             let dietfilter;
             var finalarrplan1 = [];
             var result = [];
             const arrplan1 = preparemealplan1;
   
             for (let i = 0; i < arrplan1.length; i++) {
               let checkmeal = 'meal' + [i+1]
               var dynObj = {};
               dynObj[checkmeal] = "TRUE";
   
               dietfilter = { $and: [ filter , dynObj ] }
               //  console.log(arrplan1[i].cal);
               // console.log("dietfilter",dietfilter);
               var category = [
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
               ]
   
                 var mealVal = {
                   cal: arrplan1[i].cal,
                   carb: arrplan1[i].carb,
                   protein: arrplan1[i].protein,
                   fat: arrplan1[i].fat,
                 }
   
                 var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                 var finalmeal =  meal
                 finalarrplan1.push(finalmeal);
             }
 
             var fmeal = finalarrplan1;
               if(mealno == 1){
                 if(foodposition == 0){
                   var newmeal = fmeal[0][0].calories;
                   var newname = fmeal[0][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal10 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
                   MealFood.mealplan[0][0].calories = newmeal
                   MealFood.mealplan[0][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[0][1].carbs;
                   var newname = fmeal[0][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal11 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
                   MealFood.mealplan[0][1].carbs = newmeal
                   MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[0][2].proteins;
                   var newname = fmeal[0][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal12 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[0][3].fats.prot)
                   MealFood.mealplan[0][2].proteins = newmeal
                   MealFood.mealplan[0][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[0][3].fats;
                   var newname = fmeal[0][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal13 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[0][3].fats = newmeal
                   MealFood.mealplan[0][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 2){
                 if(foodposition == 0){
                   var newmeal = fmeal[1][0].calories;
                   var newname = fmeal[1][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal20 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
                   MealFood.mealplan[1][0].calories = newmeal
                   MealFood.mealplan[1][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[1][1].carbs;
                   var newname = fmeal[1][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal21 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
                   MealFood.mealplan[1][1].carbs = newmeal
                   MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[1][2].proteins;
                   var newname = fmeal[1][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal22 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[1][3].fats.prot)
                   MealFood.mealplan[1][2].proteins = newmeal
                   MealFood.mealplan[1][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[1][3].fats;
                   var newname = fmeal[1][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal23 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[1][3].fats = newmeal
                   MealFood.mealplan[1][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 3){
                 if(foodposition == 0){
                   var newmeal = fmeal[2][0].calories;
                   var newname = fmeal[2][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal30 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
                   MealFood.mealplan[2][0].calories = newmeal
                   MealFood.mealplan[2][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[2][1].carbs;
                   var newname = fmeal[2][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal31 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
                   MealFood.mealplan[2][1].carbs = newmeal
                   MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[2][2].proteins;
                   var newname = fmeal[2][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal32 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[2][3].fats.prot)
                   MealFood.mealplan[2][2].proteins = newmeal
                   MealFood.mealplan[2][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[2][3].fats;
                   var newname = fmeal[2][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal33 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[2][3].fats = newmeal
                   MealFood.mealplan[2][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 4){
                 if(foodposition == 0){
                   var newmeal = fmeal[3][0].calories;
                   var newname = fmeal[3][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal40 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
                   MealFood.mealplan[3][0].calories = newmeal
                   MealFood.mealplan[3][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[3][1].carbs;
                   var newname = fmeal[3][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal41 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
                   MealFood.mealplan[3][1].carbs = newmeal
                   MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[3][2].proteins;
                   var newname = fmeal[3][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal42 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[3][3].fats.prot)
                   MealFood.mealplan[3][2].proteins = newmeal
                   MealFood.mealplan[3][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[3][3].fats;
                   var newname = fmeal[3][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal43 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[3][3].fats = newmeal
                   MealFood.mealplan[3][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 5){
                 if(foodposition == 0){
                   var newmeal = fmeal[4][0].calories;
                   var newname = fmeal[4][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal50 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
                   MealFood.mealplan[4][0].calories = newmeal
                   MealFood.mealplan[4][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[4][1].carbs;
                   var newname = fmeal[4][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal51 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
                   MealFood.mealplan[4][1].carbs = newmeal
                   MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
 
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[4][2].proteins;
                   var newname = fmeal[4][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal52 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[4][3].fats.prot)
                   MealFood.mealplan[4][2].proteins = newmeal
                   MealFood.mealplan[4][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[4][3].fats;
                   var newname = fmeal[4][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal53 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[4][3].fats = newmeal
                   MealFood.mealplan[4][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 6){
                 if(foodposition == 0){
                   var newmeal = fmeal[5][0].calories;
                   var newname = fmeal[5][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal60 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
                   MealFood.mealplan[5][0].calories = newmeal
                   MealFood.mealplan[5][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[5][1].carbs;
                   var newname = fmeal[5][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal61 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
                   MealFood.mealplan[5][1].carbs = newmeal
                   MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[5][2].proteins;
                   var newname = fmeal[5][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal62 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[5][3].fats.prot)
                   MealFood.mealplan[5][2].proteins = newmeal
                   MealFood.mealplan[5][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[5][3].fats;
                   var newname = fmeal[5][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal63 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[5][3].fats = newmeal
                   MealFood.mealplan[5][4].total.totalFats = totalFats
                 }
               }
 
               var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
               //console.log("UpdateMealFood",UpdateMealFood);
               return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
   
           }
 
         }
         else{
           // female
 
           if (goal == 3) {
             // goal - 3 (two meal plan)
             var usercalories1 = MealFood.mealplan1;
             var usercalories2 = MealFood.mealplan2;
             var usercarbs = MealFood.carbs;
             var userprotein = MealFood.protein;
             var userfat = MealFood.fat;
             var mealpercentage = MealFood.mealpercentage;
             var mealplantype = MealFood.mealplantype;
     
             var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
             var preparemealplan2 = await UserService.preparemealplan1v2(usercalories2, usercarbs, userprotein, userfat, mealpercentage);
     
             var userdiet = MealFood.diettype;
             let filter;
             if(userdiet == 1){
               filter =  { paleo: { $ne: "FALSE" } }
             }
             else if(userdiet == 2){
               filter = { mediterranean: { $ne: "FALSE" } }
             } 
             else if(userdiet == 3){
              filter = { pescatarian: { $ne: "FALSE" } }
            }
            else if(userdiet == 4){
              filter = { vegan: { $ne: "FALSE" } }
            }
             else{
               filter = {}
             }
               let dietfilter;
               var finalarrplan1 = [];
               var finalarrplan2 = [];
               var result = [];
               const arrplan1 = preparemealplan1;
               const arrplan2 = preparemealplan2;
     
               for (let i = 0; i < arrplan1.length; i++) {
                 let checkmeal = 'meal' + [i+1]
                 var dynObj = {};
                 dynObj[checkmeal] = "TRUE";
     
                 dietfilter = { $and: [ filter , dynObj ] }
                 //  console.log(arrplan1[i].cal);
                 // console.log("dietfilter",dietfilter);
                 var category = [
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 ]
     
                   var mealVal = {
                     cal: arrplan1[i].cal,
                     carb: arrplan1[i].carb,
                     protein: arrplan1[i].protein,
                     fat: arrplan1[i].fat,
                   }
     
                   var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                   var finalmeal =  meal
                   finalarrplan1.push(finalmeal);
     
               }
     
               for (let i = 0; i < arrplan2.length; i++) {
                 let checkmeal = 'meal' + [i+1]
                 var dynObj = {};
                 dynObj[checkmeal] = "TRUE";
     
                 dietfilter = { $and: [ filter , dynObj ] }
                 //  console.log(arrplan2[i].cal);
                 // console.log("dietfilter",dietfilter);
                 var category = [
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 ]
     
                   var mealVal = {
                     cal: arrplan2[i].cal,
                     carb: arrplan2[i].carb,
                     protein: arrplan2[i].protein,
                     fat: arrplan2[i].fat,
                   }
     
                   var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                   var finalmeal =  meal
                   finalarrplan2.push(finalmeal);
     
               }
 
               if(mealplantype == 1){
                 var fmeal = finalarrplan1;
                 // 3 day finalarrplan1
               }
               else{
                 var fmeal = finalarrplan2;
                 // finalarrplan2
               }
               if(mealno == 1){
                 if(foodposition == 0){
                   var newmeal = fmeal[0][0].calories;
                   var newname = fmeal[0][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal10 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
                   MealFood.mealplan[0][0].calories = newmeal
                   MealFood.mealplan[0][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[0][1].carbs;
                   var newname = fmeal[0][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal11 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
                   MealFood.mealplan[0][1].carbs = newmeal
                   MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[0][2].proteins;
                   var newname = fmeal[0][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal12 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[0][3].fats.prot)
                   MealFood.mealplan[0][2].proteins = newmeal
                   MealFood.mealplan[0][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[0][3].fats;
                   var newname = fmeal[0][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal13 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[0][3].fats = newmeal
                   MealFood.mealplan[0][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 2){
                 if(foodposition == 0){
                   var newmeal = fmeal[1][0].calories;
                   var newname = fmeal[1][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal20 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
                   MealFood.mealplan[1][0].calories = newmeal
                   MealFood.mealplan[1][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[1][1].carbs;
                   var newname = fmeal[1][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal21 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
                   MealFood.mealplan[1][1].carbs = newmeal
                   MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[1][2].proteins;
                   var newname = fmeal[1][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal22 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[1][3].fats.prot)
                   MealFood.mealplan[1][2].proteins = newmeal
                   MealFood.mealplan[1][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[1][3].fats;
                   var newname = fmeal[1][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal23 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[1][3].fats = newmeal
                   MealFood.mealplan[1][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 3){
                 if(foodposition == 0){
                   var newmeal = fmeal[2][0].calories;
                   var newname = fmeal[2][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal30 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
                   MealFood.mealplan[2][0].calories = newmeal
                   MealFood.mealplan[2][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[2][1].carbs;
                   var newname = fmeal[2][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal31 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
                   MealFood.mealplan[2][1].carbs = newmeal
                   MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[2][2].proteins;
                   var newname = fmeal[2][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal32 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[2][3].fats.prot)
                   MealFood.mealplan[2][2].proteins = newmeal
                   MealFood.mealplan[2][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[2][3].fats;
                   var newname = fmeal[2][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal33 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[2][3].fats = newmeal
                   MealFood.mealplan[2][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 4){
                 if(foodposition == 0){
                   var newmeal = fmeal[3][0].calories;
                   var newname = fmeal[3][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal40 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
                   MealFood.mealplan[3][0].calories = newmeal
                   MealFood.mealplan[3][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[3][1].carbs;
                   var newname = fmeal[3][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal41 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
                   MealFood.mealplan[3][1].carbs = newmeal
                   MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[3][2].proteins;
                   var newname = fmeal[3][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal42 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[3][3].fats.prot)
                   MealFood.mealplan[3][2].proteins = newmeal
                   MealFood.mealplan[3][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[3][3].fats;
                   var newname = fmeal[3][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal43 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[3][3].fats = newmeal
                   MealFood.mealplan[3][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 5){
                 if(foodposition == 0){
                   var newmeal = fmeal[4][0].calories;
                   var newname = fmeal[4][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal50 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
                   MealFood.mealplan[4][0].calories = newmeal
                   MealFood.mealplan[4][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[4][1].carbs;
                   var newname = fmeal[4][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal51 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
                   MealFood.mealplan[4][1].carbs = newmeal
                   MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
 
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[4][2].proteins;
                   var newname = fmeal[4][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal52 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[4][3].fats.prot)
                   MealFood.mealplan[4][2].proteins = newmeal
                   MealFood.mealplan[4][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[4][3].fats;
                   var newname = fmeal[4][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal53 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[4][3].fats = newmeal
                   MealFood.mealplan[4][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 6){
                 if(foodposition == 0){
                   var newmeal = fmeal[5][0].calories;
                   var newname = fmeal[5][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal60 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
                   MealFood.mealplan[5][0].calories = newmeal
                   MealFood.mealplan[5][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[5][1].carbs;
                   var newname = fmeal[5][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal61 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
                   MealFood.mealplan[5][1].carbs = newmeal
                   MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[5][2].proteins;
                   var newname = fmeal[5][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal62 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[5][3].fats.prot)
                   MealFood.mealplan[5][2].proteins = newmeal
                   MealFood.mealplan[5][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[5][3].fats;
                   var newname = fmeal[5][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal63 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[5][3].fats = newmeal
                   MealFood.mealplan[5][4].total.totalFats = totalFats
                 }
               }
 
               var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
               //console.log("UpdateMealFood",UpdateMealFood);
               return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
           }
           else if (goal == 2) {
             // goal plan 2 (1 day meal)
             var usercalories1 = MealFood.mealplan1;
             var usercarbs = MealFood.carbs;
             var userprotein = MealFood.protein;
             var userfat = MealFood.fat;
             var mealpercentage = MealFood.mealpercentage;
     
             var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
     
             var userdiet = MealFood.diettype;
             let filter;
             if(userdiet == 1){
               filter =  { paleo: { $ne: "FALSE" } }
             }
             else if(userdiet == 2){
               filter = { mediterranean: { $ne: "FALSE" } }
             }
             else if(userdiet == 3){
              filter = { pescatarian: { $ne: "FALSE" } }
            }
            else if(userdiet == 4){
              filter = { vegan: { $ne: "FALSE" } }
            }
             else{
               filter = {}
             }
     
             let dietfilter;
             var finalarrplan1 = [];
             var result = [];
             const arrplan1 = preparemealplan1;
     
               for (let i = 0; i < arrplan1.length; i++) {
                 let checkmeal = 'meal' + [i+1]
                 var dynObj = {};
                 dynObj[checkmeal] = "TRUE";
     
                 dietfilter = { $and: [ filter , dynObj ] }
                 //  console.log(arrplan1[i].cal);
                 // console.log("dietfilter",dietfilter);
                 var category = [
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                   { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 ]
     
                   var mealVal = {
                     cal: arrplan1[i].cal,
                     carb: arrplan1[i].carb,
                     protein: arrplan1[i].protein,
                     fat: arrplan1[i].fat,
                   }
     
                   var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                   var finalmeal =  meal
                   finalarrplan1.push(finalmeal);
     
               }
 
               var fmeal = finalarrplan1;
               if(mealno == 1){
                 if(foodposition == 0){
                   var newmeal = fmeal[0][0].calories;
                   var newname = fmeal[0][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal10 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
                   MealFood.mealplan[0][0].calories = newmeal
                   MealFood.mealplan[0][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[0][1].carbs;
                   var newname = fmeal[0][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal11 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
                   MealFood.mealplan[0][1].carbs = newmeal
                   MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[0][2].proteins;
                   var newname = fmeal[0][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal12 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[0][3].fats.prot)
                   MealFood.mealplan[0][2].proteins = newmeal
                   MealFood.mealplan[0][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[0][3].fats;
                   var newname = fmeal[0][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal13 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[0][3].fats = newmeal
                   MealFood.mealplan[0][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 2){
                 if(foodposition == 0){
                   var newmeal = fmeal[1][0].calories;
                   var newname = fmeal[1][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal20 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
                   MealFood.mealplan[1][0].calories = newmeal
                   MealFood.mealplan[1][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[1][1].carbs;
                   var newname = fmeal[1][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal21 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
                   MealFood.mealplan[1][1].carbs = newmeal
                   MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[1][2].proteins;
                   var newname = fmeal[1][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal22 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[1][3].fats.prot)
                   MealFood.mealplan[1][2].proteins = newmeal
                   MealFood.mealplan[1][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[1][3].fats;
                   var newname = fmeal[1][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal23 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[1][3].fats = newmeal
                   MealFood.mealplan[1][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 3){
                 if(foodposition == 0){
                   var newmeal = fmeal[2][0].calories;
                   var newname = fmeal[2][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal30 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
                   MealFood.mealplan[2][0].calories = newmeal
                   MealFood.mealplan[2][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[2][1].carbs;
                   var newname = fmeal[2][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal31 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
                   MealFood.mealplan[2][1].carbs = newmeal
                   MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[2][2].proteins;
                   var newname = fmeal[2][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal32 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[2][3].fats.prot)
                   MealFood.mealplan[2][2].proteins = newmeal
                   MealFood.mealplan[2][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[2][3].fats;
                   var newname = fmeal[2][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal33 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[2][3].fats = newmeal
                   MealFood.mealplan[2][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 4){
                 if(foodposition == 0){
                   var newmeal = fmeal[3][0].calories;
                   var newname = fmeal[3][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal40 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
                   MealFood.mealplan[3][0].calories = newmeal
                   MealFood.mealplan[3][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[3][1].carbs;
                   var newname = fmeal[3][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal41 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
                   MealFood.mealplan[3][1].carbs = newmeal
                   MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[3][2].proteins;
                   var newname = fmeal[3][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal42 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[3][3].fats.prot)
                   MealFood.mealplan[3][2].proteins = newmeal
                   MealFood.mealplan[3][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[3][3].fats;
                   var newname = fmeal[3][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal43 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[3][3].fats = newmeal
                   MealFood.mealplan[3][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 5){
                 if(foodposition == 0){
                   var newmeal = fmeal[4][0].calories;
                   var newname = fmeal[4][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal50 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
                   MealFood.mealplan[4][0].calories = newmeal
                   MealFood.mealplan[4][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[4][1].carbs;
                   var newname = fmeal[4][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal51 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
                   MealFood.mealplan[4][1].carbs = newmeal
                   MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
 
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[4][2].proteins;
                   var newname = fmeal[4][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal52 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[4][3].fats.prot)
                   MealFood.mealplan[4][2].proteins = newmeal
                   MealFood.mealplan[4][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[4][3].fats;
                   var newname = fmeal[4][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal53 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[4][3].fats = newmeal
                   MealFood.mealplan[4][4].total.totalFats = totalFats
                 }
               }
         
               if(mealno == 6){
                 if(foodposition == 0){
                   var newmeal = fmeal[5][0].calories;
                   var newname = fmeal[5][0].calories.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal60 : [ newname ] } } );
                   var totalCal = (newmeal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
                   MealFood.mealplan[5][0].calories = newmeal
                   MealFood.mealplan[5][4].total.totalCal = totalCal
                 }
                 if(foodposition == 1){
                   var newmeal = fmeal[5][1].carbs;
                   var newname = fmeal[5][1].carbs.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal61 : [ newname ] } } );
                   var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
                   MealFood.mealplan[5][1].carbs = newmeal
                   MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
                 }
                 if(foodposition == 2){
                   var newmeal = fmeal[5][2].proteins;
                   var newname = fmeal[5][2].proteins.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal62 : [ newname ] } } );
                   var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[5][3].fats.prot)
                   MealFood.mealplan[5][2].proteins = newmeal
                   MealFood.mealplan[5][4].total.totalProt = totalProt
                 }
                 if(foodposition == 3){
                   var newmeal = fmeal[5][3].fats;
                   var newname = fmeal[5][3].fats.grocery_list_name;
                   var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal63 : [ newname ] } } );
                   var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (newmeal.fats)
                   MealFood.mealplan[5][3].fats = newmeal
                   MealFood.mealplan[5][4].total.totalFats = totalFats
                 }
               }
 
               var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
               //console.log("UpdateMealFood",UpdateMealFood);
               return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
           }
           else {
             // goal 3 (1 day meal )
             var usercalories1 = MealFood.mealplan1;
             var usercarbs = MealFood.carbs;
             var userprotein = MealFood.protein;
             var userfat = MealFood.fat;
             var mealpercentage = MealFood.mealpercentage;
     
             var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
     
             var userdiet = MealFood.diettype;
             let filter;
             if(userdiet == 1){
               filter =  { paleo: { $ne: "FALSE" } }
             }
             else if(userdiet == 2){
               filter = { mediterranean: { $ne: "FALSE" } }
             }
             else if(userdiet == 3){
              filter = { pescatarian: { $ne: "FALSE" } }
            }
            else if(userdiet == 4){
              filter = { vegan: { $ne: "FALSE" } }
            }
             else{
               filter = {}
             }
             let dietfilter;
             var finalarrplan1 = [];
             var result = [];
             const arrplan1 = preparemealplan1;
     
             for (let i = 0; i < arrplan1.length; i++) {
               let checkmeal = 'meal' + [i+1]
               var dynObj = {};
               dynObj[checkmeal] = "TRUE";
     
               dietfilter = { $and: [ filter , dynObj ] }
               //  console.log(arrplan1[i].cal);
               // console.log("dietfilter",dietfilter);
               var category = [
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                 { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
               ]
     
                 var mealVal = {
                   cal: arrplan1[i].cal,
                   carb: arrplan1[i].carb,
                   protein: arrplan1[i].protein,
                   fat: arrplan1[i].fat,
                 }
     
                 var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                 var finalmeal =  meal
                 finalarrplan1.push(finalmeal);
     
             }
 
             var fmeal = finalarrplan1;
             if(mealno == 1){
               if(foodposition == 0){
                 var newmeal = fmeal[0][0].calories;
                 var newname = fmeal[0][0].calories.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal10 : [ newname ] } } );
                 var totalCal = (newmeal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
                 MealFood.mealplan[0][0].calories = newmeal
                 MealFood.mealplan[0][4].total.totalCal = totalCal
               }
               if(foodposition == 1){
                 var newmeal = fmeal[0][1].carbs;
                 var newname = fmeal[0][1].carbs.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal11 : [ newname ] } } );
                 var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
                 MealFood.mealplan[0][1].carbs = newmeal
                 MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
               }
               if(foodposition == 2){
                 var newmeal = fmeal[0][2].proteins;
                 var newname = fmeal[0][2].proteins.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal12 : [ newname ] } } );
                 var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[0][3].fats.prot)
                 MealFood.mealplan[0][2].proteins = newmeal
                 MealFood.mealplan[0][4].total.totalProt = totalProt
               }
               if(foodposition == 3){
                 var newmeal = fmeal[0][3].fats;
                 var newname = fmeal[0][3].fats.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal13 : [ newname ] } } );
                 var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (newmeal.fats)
                 MealFood.mealplan[0][3].fats = newmeal
                 MealFood.mealplan[0][4].total.totalFats = totalFats
               }
             }
       
             if(mealno == 2){
               if(foodposition == 0){
                 var newmeal = fmeal[1][0].calories;
                 var newname = fmeal[1][0].calories.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal20 : [ newname ] } } );
                 var totalCal = (newmeal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
                 MealFood.mealplan[1][0].calories = newmeal
                 MealFood.mealplan[1][4].total.totalCal = totalCal
               }
               if(foodposition == 1){
                 var newmeal = fmeal[1][1].carbs;
                 var newname = fmeal[1][1].carbs.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal21 : [ newname ] } } );
                 var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
                 MealFood.mealplan[1][1].carbs = newmeal
                 MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
               }
               if(foodposition == 2){
                 var newmeal = fmeal[1][2].proteins;
                 var newname = fmeal[1][2].proteins.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal22 : [ newname ] } } );
                 var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[1][3].fats.prot)
                 MealFood.mealplan[1][2].proteins = newmeal
                 MealFood.mealplan[1][4].total.totalProt = totalProt
               }
               if(foodposition == 3){
                 var newmeal = fmeal[1][3].fats;
                 var newname = fmeal[1][3].fats.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal23 : [ newname ] } } );
                 var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (newmeal.fats)
                 MealFood.mealplan[1][3].fats = newmeal
                 MealFood.mealplan[1][4].total.totalFats = totalFats
               }
             }
       
             if(mealno == 3){
               if(foodposition == 0){
                 var newmeal = fmeal[2][0].calories;
                 var newname = fmeal[2][0].calories.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal30 : [ newname ] } } );
                 var totalCal = (newmeal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
                 MealFood.mealplan[2][0].calories = newmeal
                 MealFood.mealplan[2][4].total.totalCal = totalCal
               }
               if(foodposition == 1){
                 var newmeal = fmeal[2][1].carbs;
                 var newname = fmeal[2][1].carbs.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal31 : [ newname ] } } );
                 var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
                 MealFood.mealplan[2][1].carbs = newmeal
                 MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
               }
               if(foodposition == 2){
                 var newmeal = fmeal[2][2].proteins;
                 var newname = fmeal[2][2].proteins.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal32 : [ newname ] } } );
                 var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[2][3].fats.prot)
                 MealFood.mealplan[2][2].proteins = newmeal
                 MealFood.mealplan[2][4].total.totalProt = totalProt
               }
               if(foodposition == 3){
                 var newmeal = fmeal[2][3].fats;
                 var newname = fmeal[2][3].fats.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal33 : [ newname ] } } );
                 var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (newmeal.fats)
                 MealFood.mealplan[2][3].fats = newmeal
                 MealFood.mealplan[2][4].total.totalFats = totalFats
               }
             }
       
             if(mealno == 4){
               if(foodposition == 0){
                 var newmeal = fmeal[3][0].calories;
                 var newname = fmeal[3][0].calories.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal40 : [ newname ] } } );
                 var totalCal = (newmeal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
                 MealFood.mealplan[3][0].calories = newmeal
                 MealFood.mealplan[3][4].total.totalCal = totalCal
               }
               if(foodposition == 1){
                 var newmeal = fmeal[3][1].carbs;
                 var newname = fmeal[3][1].carbs.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal41 : [ newname ] } } );
                 var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
                 MealFood.mealplan[3][1].carbs = newmeal
                 MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
               }
               if(foodposition == 2){
                 var newmeal = fmeal[3][2].proteins;
                 var newname = fmeal[3][2].proteins.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal42 : [ newname ] } } );
                 var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[3][3].fats.prot)
                 MealFood.mealplan[3][2].proteins = newmeal
                 MealFood.mealplan[3][4].total.totalProt = totalProt
               }
               if(foodposition == 3){
                 var newmeal = fmeal[3][3].fats;
                 var newname = fmeal[3][3].fats.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal43 : [ newname ] } } );
                 var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (newmeal.fats)
                 MealFood.mealplan[3][3].fats = newmeal
                 MealFood.mealplan[3][4].total.totalFats = totalFats
               }
             }
       
             if(mealno == 5){
               if(foodposition == 0){
                 var newmeal = fmeal[4][0].calories;
                 var newname = fmeal[4][0].calories.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal50 : [ newname ] } } );
                 var totalCal = (newmeal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
                 MealFood.mealplan[4][0].calories = newmeal
                 MealFood.mealplan[4][4].total.totalCal = totalCal
               }
               if(foodposition == 1){
                 var newmeal = fmeal[4][1].carbs;
                 var newname = fmeal[4][1].carbs.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal51 : [ newname ] } } );
                 var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
                 MealFood.mealplan[4][1].carbs = newmeal
                 MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
 
               }
               if(foodposition == 2){
                 var newmeal = fmeal[4][2].proteins;
                 var newname = fmeal[4][2].proteins.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal52 : [ newname ] } } );
                 var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[4][3].fats.prot)
                 MealFood.mealplan[4][2].proteins = newmeal
                 MealFood.mealplan[4][4].total.totalProt = totalProt
               }
               if(foodposition == 3){
                 var newmeal = fmeal[4][3].fats;
                 var newname = fmeal[4][3].fats.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal53 : [ newname ] } } );
                 var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (newmeal.fats)
                 MealFood.mealplan[4][3].fats = newmeal
                 MealFood.mealplan[4][4].total.totalFats = totalFats
               }
             }
       
             if(mealno == 6){
               if(foodposition == 0){
                 var newmeal = fmeal[5][0].calories;
                 var newname = fmeal[5][0].calories.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal60 : [ newname ] } } );
                 var totalCal = (newmeal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
                 MealFood.mealplan[5][0].calories = newmeal
                 MealFood.mealplan[5][4].total.totalCal = totalCal
               }
               if(foodposition == 1){
                 var newmeal = fmeal[5][1].carbs;
                 var newname = fmeal[5][1].carbs.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal61 : [ newname ] } } );
                 var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (newmeal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
                 MealFood.mealplan[5][1].carbs = newmeal
                 MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
               }
               if(foodposition == 2){
                 var newmeal = fmeal[5][2].proteins;
                 var newname = fmeal[5][2].proteins.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal62 : [ newname ] } } );
                 var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (newmeal.prot) + ( MealFood.mealplan[5][3].fats.prot)
                 MealFood.mealplan[5][2].proteins = newmeal
                 MealFood.mealplan[5][4].total.totalProt = totalProt
               }
               if(foodposition == 3){
                 var newmeal = fmeal[5][3].fats;
                 var newname = fmeal[5][3].fats.grocery_list_name;
                 var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $set: { meal63 : [ newname ] } } );
                 var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (newmeal.fats)
                 MealFood.mealplan[5][3].fats = newmeal
                 MealFood.mealplan[5][4].total.totalFats = totalFats
               }
             }
 
             var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
             //console.log("UpdateMealFood",UpdateMealFood);
             return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
     
           }
     
         }
         // return responseModel.failResponse("There are no other alternative foods found.");
       }
       else{
         if(mealno == 1){
           var mealname = meal.grocery_list_name;
           if(foodposition == 0){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal10 : mealname }});
             var totalCal = (meal.cal) + (MealFood.mealplan[0][1].carbs.cal) + (MealFood.mealplan[0][2].proteins.cal) + (MealFood.mealplan[0][3].fats.cal)
             MealFood.mealplan[0][0].calories = meal
             MealFood.mealplan[0][4].total.totalCal = totalCal
           }
           if(foodposition == 1){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal11 : mealname }});
             var totalCarbo = (MealFood.mealplan[0][0].calories.carbs) + (meal.carbs) + (MealFood.mealplan[0][2].proteins.carbs) + ( MealFood.mealplan[0][3].fats.carbs)
             MealFood.mealplan[0][1].carbs = meal
             MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
           }
           if(foodposition == 2){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal12 : mealname }});
             var totalProt = (MealFood.mealplan[0][0].calories.prot) + (MealFood.mealplan[0][1].carbs.prot) + (meal.prot) + ( MealFood.mealplan[0][3].fats.prot)
             MealFood.mealplan[0][2].proteins = meal
             MealFood.mealplan[0][4].total.totalProt = totalProt
           }
           if(foodposition == 3){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal13 : mealname }});
             var totalFats = (MealFood.mealplan[0][0].calories.fats) + (MealFood.mealplan[0][1].carbs.fats) + (MealFood.mealplan[0][2].proteins.fats) + (meal.fats)
             MealFood.mealplan[0][3].fats = meal
             MealFood.mealplan[0][4].total.totalFats = totalFats
           }
         }
   
         if(mealno == 2){
           var mealname = meal.grocery_list_name;
           if(foodposition == 0){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal20 : mealname }});
             var totalCal = (meal.cal) + (MealFood.mealplan[1][1].carbs.cal) + (MealFood.mealplan[1][2].proteins.cal) + ( MealFood.mealplan[1][3].fats.cal)
             MealFood.mealplan[1][0].calories = meal
             MealFood.mealplan[1][4].total.totalCal = totalCal
           }
           if(foodposition == 1){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal21 : mealname }});
             var totalCarbo = (MealFood.mealplan[1][0].calories.carbs) + (meal.carbs) + (MealFood.mealplan[1][2].proteins.carbs) + ( MealFood.mealplan[1][3].fats.carbs)
             MealFood.mealplan[1][1].carbs = meal
             MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
           }
           if(foodposition == 2){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal22 : mealname }});
             var totalProt = (MealFood.mealplan[1][0].calories.prot) + (MealFood.mealplan[1][1].carbs.prot) + (meal.prot) + ( MealFood.mealplan[1][3].fats.prot)
             MealFood.mealplan[1][2].proteins = meal
             MealFood.mealplan[1][4].total.totalProt = totalProt
           }
           if(foodposition == 3){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal23 : mealname }});
             var totalFats = (MealFood.mealplan[1][0].calories.fats) + (MealFood.mealplan[1][1].carbs.fats) + (MealFood.mealplan[1][2].proteins.fats) + (meal.fats)
             MealFood.mealplan[1][3].fats = meal
             MealFood.mealplan[1][4].total.totalFats = totalFats
           }
         }
   
         if(mealno == 3){
           var mealname = meal.grocery_list_name;
           if(foodposition == 0){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal30 : mealname }});
             var totalCal = (meal.cal) + (MealFood.mealplan[2][1].carbs.cal) + (MealFood.mealplan[2][2].proteins.cal) + ( MealFood.mealplan[2][3].fats.cal)
             MealFood.mealplan[2][0].calories = meal
             MealFood.mealplan[2][4].total.totalCal = totalCal
           }
           if(foodposition == 1){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal31 : mealname }});
             var totalCarbo = (MealFood.mealplan[2][0].calories.carbs) + (meal.carbs) + (MealFood.mealplan[2][2].proteins.carbs) + ( MealFood.mealplan[2][3].fats.carbs)
             MealFood.mealplan[2][1].carbs = meal
             MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
           }
           if(foodposition == 2){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal32 : mealname }});
             var totalProt = (MealFood.mealplan[2][0].calories.prot) + (MealFood.mealplan[2][1].carbs.prot) + (meal.prot) + ( MealFood.mealplan[2][3].fats.prot)
             MealFood.mealplan[2][2].proteins = meal
             MealFood.mealplan[2][4].total.totalProt = totalProt
           }
           if(foodposition == 3){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal33 : mealname }});
             var totalFats = (MealFood.mealplan[2][0].calories.fats) + (MealFood.mealplan[2][1].carbs.fats) + (MealFood.mealplan[2][2].proteins.fats) + (meal.fats)
             MealFood.mealplan[2][3].fats = meal
             MealFood.mealplan[2][4].total.totalFats = totalFats
           }
         }
   
         if(mealno == 4){
           var mealname = meal.grocery_list_name;
           if(foodposition == 0){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal40 : mealname }});
             var totalCal = (meal.cal) + (MealFood.mealplan[3][1].carbs.cal) + (MealFood.mealplan[3][2].proteins.cal) + ( MealFood.mealplan[3][3].fats.cal)
             MealFood.mealplan[3][0].calories = meal
             MealFood.mealplan[3][4].total.totalCal = totalCal
           }
           if(foodposition == 1){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal41 : mealname }});
             var totalCarbo = (MealFood.mealplan[3][0].calories.carbs) + (meal.carbs) + (MealFood.mealplan[3][2].proteins.carbs) + ( MealFood.mealplan[3][3].fats.carbs)
             MealFood.mealplan[3][1].carbs = meal
             MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
           }
           if(foodposition == 2){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal42 : mealname }});
             var totalProt = (MealFood.mealplan[3][0].calories.prot) + (MealFood.mealplan[3][1].carbs.prot) + (meal.prot) + ( MealFood.mealplan[3][3].fats.prot)
             MealFood.mealplan[3][2].proteins = meal
             MealFood.mealplan[3][4].total.totalProt = totalProt
           }
           if(foodposition == 3){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal43 : mealname }});
             var totalFats = (MealFood.mealplan[3][0].calories.fats) + (MealFood.mealplan[3][1].carbs.fats) + (MealFood.mealplan[3][2].proteins.fats) + (meal.fats)
             MealFood.mealplan[3][3].fats = meal
             MealFood.mealplan[3][4].total.totalFats = totalFats
           }
         }
   
         if(mealno == 5){
           var mealname = meal.grocery_list_name;
           if(foodposition == 0){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal50 : mealname }});
             var totalCal = (meal.cal) + (MealFood.mealplan[4][1].carbs.cal) + (MealFood.mealplan[4][2].proteins.cal) + ( MealFood.mealplan[4][3].fats.cal)
             MealFood.mealplan[4][0].calories = meal
             MealFood.mealplan[4][4].total.totalCal = totalCal
           }
           if(foodposition == 1){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal51 : mealname }});
             var totalCarbo = (MealFood.mealplan[4][0].calories.carbs) + (meal.carbs) + (MealFood.mealplan[4][2].proteins.carbs) + ( MealFood.mealplan[4][3].fats.carbs)
             MealFood.mealplan[4][1].carbs = meal
             MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
           }
           if(foodposition == 2){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal52 : mealname }});
             var totalProt = (MealFood.mealplan[4][0].calories.prot) + (MealFood.mealplan[4][1].carbs.prot) + (meal.prot) + ( MealFood.mealplan[4][3].fats.prot)
             MealFood.mealplan[4][2].proteins = meal
             MealFood.mealplan[4][4].total.totalProt = totalProt
           }
           if(foodposition == 3){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal53 : mealname }});
             var totalFats = (MealFood.mealplan[4][0].calories.fats) + (MealFood.mealplan[4][1].carbs.fats) + (MealFood.mealplan[4][2].proteins.fats) + (meal.fats)
             MealFood.mealplan[4][3].fats = meal
             MealFood.mealplan[4][4].total.totalFats = totalFats
           }
         }
   
         if(mealno == 6){
           var mealname = meal.grocery_list_name;
           if(foodposition == 0){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal60 : mealname }});
             var totalCal = (meal.cal) + (MealFood.mealplan[5][1].carbs.cal) + (MealFood.mealplan[5][2].proteins.cal) + ( MealFood.mealplan[5][3].fats.cal)
             MealFood.mealplan[5][0].calories = meal
             MealFood.mealplan[5][4].total.totalCal = totalCal
           }
           if(foodposition == 1){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal61 : mealname }});
             var totalCarbo = (MealFood.mealplan[5][0].calories.carbs) + (meal.carbs) + (MealFood.mealplan[5][2].proteins.carbs) + ( MealFood.mealplan[5][3].fats.carbs)
             MealFood.mealplan[5][1].carbs = meal
             MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
           }
           if(foodposition == 2){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal62 : mealname }});
             var totalProt = (MealFood.mealplan[5][0].calories.prot) + (MealFood.mealplan[5][1].carbs.prot) + (meal.prot) + ( MealFood.mealplan[5][3].fats.prot)
             MealFood.mealplan[5][2].proteins = meal
             MealFood.mealplan[5][4].total.totalProt = totalProt
           }
           if(foodposition == 3){
             var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal63 : mealname }});
             var totalFats = (MealFood.mealplan[5][0].calories.fats) + (MealFood.mealplan[5][1].carbs.fats) + (MealFood.mealplan[5][2].proteins.fats) + (meal.fats)
             MealFood.mealplan[5][3].fats = meal
             MealFood.mealplan[5][4].total.totalFats = totalFats
           }
         }
   
         var UpdateMealFood = await query.findOneAndUpdate(usermealcoll, { _id : usermealId}, {$set : { mealplan : MealFood.mealplan } });
         //console.log("UpdateMealFood",UpdateMealFood);
         return responseModel.successResponse("Meal food swap successfully",UpdateMealFood);
       }
     }
     else{
       return responseModel.failResponse("No Food Found!");
     }
     
   } catch (err) {
     errMessage = typeof err == 'string' ? err : err.message;
     return responseModel.failResponse("Error while swaping user's meal food: " + errMessage);
   }
}

// swap meal food api query - userservice.js
exports.swapmeal = async function (dietfilter, mealVal, mealCat, foodId, foodName, foodCategory) {
    
   try {
     var foodId = foodId;
     var foodName = foodName;
     var foodCategory = foodCategory;
 
     if(foodCategory == "Fats"){
 
       var meal = await Meal.aggregate([
         { $match: dietfilter },
         { $project: { diff: { $abs: { $subtract: [mealVal,{ $sum: [ mealCat , "0.1" ] } ] } }, doc: '$$ROOT' } },
         { $sort: { diff: 1 } },
         { $limit: 1 }
       ])
 
     }
     else{
 
       var meal = await Meal.aggregate([
         { $match: dietfilter },
         { $project: { diff: { $abs: { $subtract: [mealVal,{ $sum: [ mealCat , "0.1" ] } ] } }, doc: '$$ROOT' } },
         { $sort: { diff: 1 } },
         { $limit: 1 }
       ])
 
     }
        
     // console.log(meal);
     
     // var count = 0;
     // var temp;
     // fetchmeal(count,foodId, foodName)
     // function fetchmeal(count , foodId, foodName) {
     //   console.log("here---");
       
     //   if(count == 5){
     //     console.log("1---",count);
     //     temp = meal[count].doc
     //   }
     //   if(meal[count].doc._id == foodId){
     //     count++;
     //     console.log("2---",count);
         
     //     fetchmeal(count,foodId, foodName)
     //   }
     //   else{
     //     if(meal[count].doc.grocery_list_name == foodName){
     //       count++;
     //       console.log("3---",count);
     //       fetchmeal(count,foodId, foodName)
     //     }
     //     else{
     //       temp = meal[count].doc
     //     }
     //   }
     // }
 
     var temp  = meal[0] ? meal[0].doc : {}
     console.log("temp---",temp);
     
     return temp;
 
   } catch (err) {
     throw Error(err.message)
   }
}

exports.generatemealplan = async function (req) {

  try {

    // console.log("request---",req)
    // console.log("mealper---",req.body.mealpercentage);
    // console.log("plandate----",req.body.planDate);
    var dateofplan;
    var planDate = req.body.planDate;

    var body = {
      bodytype: req.body.body.bodytype,
      carbs: req.body.body.carbs,
      protein: req.body.body.protein,
      fat: req.body.body.fat
    }

    var workout = {
      workouttype: req.body.workout.workouttype,
      workpercentage: req.body.workout.workpercentage
    }

    var goal = req.body.goal; //  1 = I want to eat healthy and maintain my weight, 2 = Gain Weight, 3 = Shed body fat
    var weight = req.body.weight;
    var weightdata = {
      userweight: req.body.weight,
      date: Date.now()
    };
    var bodyfat = req.body.bodyfat;
    var bmr = req.body.bmr;

      var bodyfatdata = {
        userbodyfat: req.body.bodyfat,
        date: Date.now()
      };
  
      var bmrdata = {
        userbmr: req.body.bmr,
        date: Date.now()
      };
    
    var diettype = req.body.diettype;
    var mealpercentage = req.body.mealpercentage;

    var level = {
      leveltype: req.body.level.leveltype,
      levelpercentage: req.body.level.levelpercentage
    }

    let user = await query.findOneAndUpdate(collection,
      { _id: req.authenticationUser.authId },
      { $set: { body: body, workout: workout, goal: goal, weight: weight, bodyfat: bodyfat, bmr : bmr,
         diettype: diettype, level: level, mealpercentage : mealpercentage,
        updateAt : Date.now() } , $push: { weightarr : weightdata , bodyfatarr : bodyfatdata } }
    );

    if (user) {

      var userweight = user.weight;
      var userbodyfat = user.bodyfat;
      var userphysical = user.workout.workpercentage;
      var userbmr = user.bmr;
      var lbm = 0;
      var oz_water = 0.67 * userweight;
      var cups = Math.round(oz_water/8);
      if(userbodyfat > 0){
              // STEP - 1
          lbm = Math.round(userweight - (userweight * userbodyfat / 100))
          //console.log("lbm",lbm);

          userbmr = Math.round(370 + (9.79759519 * lbm))
          //console.log("bmr",userbmr);
      }

      var tdee = Math.round(userbmr * (userphysical))
      //console.log("tdee",tdee);
    
      var lbmdata = {
        userlbm : lbm,
        date: Date.now()
      }

      var bmrdata = {
        userbmr : userbmr,
        date: Date.now()
      }

      let updateuser = await query.findOneAndUpdate(collection,
        { _id: req.authenticationUser.authId },
        { $push : { lbmarr : lbmdata , bmrarr : bmrdata } , $set: { lbm: lbm, bmr: userbmr, tdee: tdee , updateAt : Date.now() }}
      );

     // console.log("userupdate=== ", updateuser);

      // STEP - 2
      var total_tdee;
      var mealplan1;
      var mealplan2;

      if (updateuser.goal == 1) {
        total_tdee = updateuser.tdee;
        mealplan1 = total_tdee;

        var updateusermeal = await query.findOneAndUpdate(collection,
          { _id: req.authenticationUser.authId },
          { $set: { total_tdee: total_tdee, mealplan1: mealplan1 , updateAt : Date.now() } }
        );

        // console.log("user goal 1----", updateusermeal);

      }
      else if (updateuser.goal == 2) {
        total_tdee = updateuser.tdee + 500;
        mealplan1 = total_tdee;

        var updateusermeal = await query.findOneAndUpdate(collection,
          { _id: req.authenticationUser.authId },
          { $set: { total_tdee: total_tdee, mealplan1: mealplan1 , updateAt : Date.now() } }
        );

        //console.log("user goal 2----", updateusermeal);

      }
      else {
        // firstmealplan for 3 days
        var firstmealplan = Math.round(updateuser.tdee - (updateuser.tdee * updateuser.level.levelpercentage / 100))
        // secondmealplan for 1 day
        var secondmealplan = updateuser.tdee

        total_tdee = firstmealplan + secondmealplan

        //console.log("firstmealplan", firstmealplan);
        //console.log("secondmealplan", secondmealplan);

        var updateusermeal = await query.findOneAndUpdate(collection,
          { _id: req.authenticationUser.authId },
          { $set: { mealplan1: firstmealplan, mealplan2: secondmealplan , updateAt : Date.now() } }
        );

      //  console.log("user goal 3----", updateusermeal);
      }

      // STEP - 3 Calorie of meals breakdown
      if (updateusermeal.gender == 'male') {
        // MALE meal breakdown

        if (updateusermeal.mealplan1 != '' && updateusermeal.mealplan2 != '' && updateusermeal.goal == 3) {
          // goal - 3 (two meal plan)
          var usercalories1 = updateusermeal.mealplan1;
          var usercalories2 = updateusermeal.mealplan2;
          var usercarbs = updateusermeal.body.carbs;
          var userprotein = updateusermeal.body.protein;
          var userfat = updateusermeal.body.fat;
          var mealpercentage = updateusermeal.mealpercentage;

          var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
          var preparemealplan2 = await UserService.preparemealplan1v2(usercalories2, usercarbs, userprotein, userfat, mealpercentage);
          //console.log("preparemealplan1--",preparemealplan1);
          //console.log("preparemealplan2--",preparemealplan2);

          var userdiet = updateusermeal.diettype;
          let filter;
          if(userdiet == 1){
            filter =  { paleo: { $ne: "FALSE" } }
          }
          else if(userdiet == 2){
            filter = { mediterranean: { $ne: "FALSE" } }
          }
          else if(userdiet == 3){
            filter = { pescatarian: { $ne: "FALSE" } }
          }
          else if(userdiet == 4){
            filter = { vegan: { $ne: "FALSE" } }
          }
          else{
            filter = {}
          }
            let dietfilter;
            var finalarrplan1 = [];
            var finalarrplan2 = [];
            var meal1_10 = [];
            var meal1_11 = [];
            var meal1_12 = [];
            var meal1_13 = [];
            var meal1_20 = [];
            var meal1_21 = [];
            var meal1_22 = [];
            var meal1_23 = [];
            var meal1_30 = [];
            var meal1_31 = [];
            var meal1_32 = [];
            var meal1_33 = [];
            var meal1_40 = [];
            var meal1_41 = [];
            var meal1_42 = [];
            var meal1_43 = [];
            var meal1_50 = [];
            var meal1_51 = [];
            var meal1_52 = [];
            var meal1_53 = [];
            var meal1_60 = [];
            var meal1_61 = [];
            var meal1_62 = [];
            var meal1_63 = [];
            var meal2_10 = [];
            var meal2_11 = [];
            var meal2_12 = [];
            var meal2_13 = [];
            var meal2_20 = [];
            var meal2_21 = [];
            var meal2_22 = [];
            var meal2_23 = [];
            var meal2_30 = [];
            var meal2_31 = [];
            var meal2_32 = [];
            var meal2_33 = [];
            var meal2_40 = [];
            var meal2_41 = [];
            var meal2_42 = [];
            var meal2_43 = [];
            var meal2_50 = [];
            var meal2_51 = [];
            var meal2_52 = [];
            var meal2_53 = [];
            var meal2_60 = [];
            var meal2_61 = [];
            var meal2_62 = [];
            var meal2_63 = [];
            var result = [];
            var dupresult = [];
            var arrplan1 = preparemealplan1;
            var arrplan2 = preparemealplan2;

            for (let i = 0; i < arrplan1.length; i++) {
              let checkmeal = 'meal' + [i+1]
              var dynObj = {};
              dynObj[checkmeal] = "TRUE";
              //console.log("checkmeal",checkmeal);
              
              dietfilter = { $and: [ filter , dynObj ] }
              //  console.log(arrplan1[i].cal);
              // console.log("dietfilter",dietfilter);

              var category = [
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              ]

                var mealVal = {
                  cal: arrplan1[i].cal,
                  carb: arrplan1[i].carb,
                  protein: arrplan1[i].protein,
                  fat: arrplan1[i].fat,
                }

                var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                var finalmeal =  meal;
                var caloriesfood = finalmeal[0].calories.grocery_list_name;
                var carbfood = finalmeal[1].carbs.grocery_list_name;
                var protinfood = finalmeal[2].proteins.grocery_list_name;
                var fatsfood = finalmeal[3].fats.grocery_list_name;
                if(checkmeal == 'meal1'){
                  meal1_10 = [ caloriesfood ];
                  meal1_11 = [ carbfood ];
                  meal1_12 = [ protinfood ];
                  meal1_13 = [ fatsfood ];
                }
                if(checkmeal == 'meal2'){
                  meal1_20 = [ caloriesfood ];
                  meal1_21 = [ carbfood ];
                  meal1_22 = [ protinfood ];
                  meal1_23 = [ fatsfood ];
                }
                if(checkmeal == 'meal3'){
                  meal1_30 = [ caloriesfood ];
                  meal1_31 = [ carbfood ];
                  meal1_32 = [ protinfood ];
                  meal1_33 = [ fatsfood ];
                }
                if(checkmeal == 'meal4'){
                  meal1_40 = [ caloriesfood ];
                  meal1_41 = [ carbfood ];
                  meal1_42 = [ protinfood ];
                  meal1_43 = [ fatsfood ];
                }
                if(checkmeal == 'meal5'){
                  meal1_50 = [ caloriesfood ];
                  meal1_51 = [ carbfood ];
                  meal1_52 = [ protinfood ];
                  meal1_53 = [ fatsfood ];
                }
                if(checkmeal == 'meal6'){
                  meal1_60 = [ caloriesfood ];
                  meal1_61 = [ carbfood ];
                  meal1_62 = [ protinfood ];
                  meal1_63 = [ fatsfood ];
                }
                finalarrplan1.push(finalmeal);

            }

            for (let i = 0; i < arrplan2.length; i++) {
              let checkmeal = 'meal' + [i+1]
              var dynObj = {};
              dynObj[checkmeal] = "TRUE";
              //console.log("checkmeal",checkmeal);
              dietfilter = { $and: [ filter , dynObj ] }
              //  console.log(arrplan2[i].cal);
              // console.log("dietfilter",dietfilter);
              var category = [
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              ]

              var mealVal = {
                cal: arrplan2[i].cal,
                carb: arrplan2[i].carb,
                protein: arrplan2[i].protein,
                fat: arrplan2[i].fat,
              }

                var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                var finalmeal =  meal;
                var caloriesfood = finalmeal[0].calories.grocery_list_name;
                var carbfood = finalmeal[1].carbs.grocery_list_name;
                var protinfood = finalmeal[2].proteins.grocery_list_name;
                var fatsfood = finalmeal[3].fats.grocery_list_name;
                if(checkmeal == 'meal1'){
                  meal2_10 = [ caloriesfood ];
                  meal2_11 = [ carbfood ];
                  meal2_12 = [ protinfood ];
                  meal2_13 = [ fatsfood ];
                }
                if(checkmeal == 'meal2'){
                  meal2_20 = [ caloriesfood ];
                  meal2_21 = [ carbfood ];
                  meal2_22 = [ protinfood ];
                  meal2_23 = [ fatsfood ];
                }
                if(checkmeal == 'meal3'){
                  meal2_30 = [ caloriesfood ];
                  meal2_31 = [ carbfood ];
                  meal2_32 = [ protinfood ];
                  meal2_33 = [ fatsfood ];
                }
                if(checkmeal == 'meal4'){
                  meal2_40 = [ caloriesfood ];
                  meal2_41 = [ carbfood ];
                  meal2_42 = [ protinfood ];
                  meal2_43 = [ fatsfood ];
                }
                if(checkmeal == 'meal5'){
                  meal2_50 = [ caloriesfood ];
                  meal2_51 = [ carbfood ];
                  meal2_52 = [ protinfood ];
                  meal2_53 = [ fatsfood ];
                }
                if(checkmeal == 'meal6'){
                  meal2_60 = [ caloriesfood ];
                  meal2_61 = [ carbfood ];
                  meal2_62 = [ protinfood ];
                  meal2_63 = [ fatsfood ];
                }
                finalarrplan2.push(finalmeal);

            }

          //  console.log("final---1--",finalarrplan1);
          //  console.log("final---2--",finalarrplan2);

          // result = [ finalarrplan1, finalarrplan2 ] // { water_cups : cups}

          for (let i = 0; i < 3; i++) {
            // var dateofplan = new Date(new Date(moment(new Date()).add(i, 'days')).setUTCHours(0, 0, 0, 0))
            if(planDate != ""){
              dateofplan = new Date(new Date(moment(planDate).add(i, 'days')).setUTCHours(0, 0, 0, 0));
            }
            else{
              dateofplan = new Date(new Date(moment(new Date()).add(i, 'days')).setUTCHours(0, 0, 0, 0));
            }
            var genmeal = {
              mealplan : finalarrplan1,
              user_id : req.authenticationUser.authId,
              mealplandate : dateofplan,
              bodytype :  updateusermeal.body.bodytype,
              carbs : updateusermeal.body.carbs,
              protein : updateusermeal.body.protein,
              fat : updateusermeal.body.fat,
              workouttype : updateusermeal.workout.workouttype,
              workpercentage : updateusermeal.workout.workpercentage,
              leveltype : updateusermeal.level.leveltype,
              levelpercentage : updateusermeal.level.levelpercentage,
              weight : updateusermeal.weight,
              bodyfat : updateusermeal.bodyfat,
              bmr : updateusermeal.bmr,
              diettype : updateusermeal.diettype,
              mealpercentage : updateusermeal.mealpercentage,
              usertype : updateusermeal.gender,
              total_tdee : updateusermeal.total_tdee,
              mealplan1 : updateusermeal.mealplan1,
              mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
              mealplantype : 1,
              mealwaterdata : cups,
              total_cups_count : cups,
              usergoal : updateusermeal.goal,
              meal10 : meal1_10,
              meal11 : meal1_11,
              meal12 : meal1_12,
              meal13 : meal1_13,
              meal20 : meal1_20,
              meal21 : meal1_21,
              meal22 : meal1_22,
              meal23 : meal1_23,
              meal30 : meal1_30,
              meal31 : meal1_31,
              meal32 : meal1_32,
              meal33 : meal1_33,
              meal40 : meal1_40,
              meal41 : meal1_41,
              meal42 : meal1_42,
              meal43 : meal1_43,
              meal50 : meal1_50,
              meal51 : meal1_51,
              meal52 : meal1_52,
              meal53 : meal1_53,
              meal60 : meal1_60,
              meal61 : meal1_61,
              meal62 : meal1_62,
              meal63 : meal1_63,
              updatedAt : new Date()
            }
            var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
            if(checkmeal){
              // update
              var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
            }
            else{
              var storemeal = await query.insert(usermealcoll, genmeal);
            }
          }

          for (let i = 0; i < 1; i++) {
            if(planDate != ""){
              dateofplan = new Date(new Date(moment(planDate).add(3, 'days')).setUTCHours(0, 0, 0, 0));
            }
            else{
              dateofplan = new Date(new Date(moment(new Date()).add(3, 'days')).setUTCHours(0, 0, 0, 0));
            }
            // var dateofplan = new Date(new Date(moment(new Date()).add(3, 'days')).setUTCHours(0, 0, 0, 0))
            var genmeal = {
              mealplan : finalarrplan2,
              user_id : req.authenticationUser.authId,
              mealplandate : dateofplan,
              bodytype :  updateusermeal.body.bodytype,
              carbs : updateusermeal.body.carbs,
              protein : updateusermeal.body.protein,
              fat : updateusermeal.body.fat,
              workouttype : updateusermeal.workout.workouttype,
              workpercentage : updateusermeal.workout.workpercentage,
              leveltype : updateusermeal.level.leveltype,
              levelpercentage : updateusermeal.level.levelpercentage,
              weight : updateusermeal.weight,
              bodyfat : updateusermeal.bodyfat,
              bmr : updateusermeal.bmr,
              diettype : updateusermeal.diettype,
              mealpercentage : updateusermeal.mealpercentage,
              usertype : updateusermeal.gender,
              total_tdee : updateusermeal.total_tdee,
              mealplan1 : updateusermeal.mealplan1,
              mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
              mealplantype : 2,
              mealwaterdata : cups,
              total_cups_count : cups,
              usergoal : updateusermeal.goal,
              meal10 : meal2_10,
              meal11 : meal2_11,
              meal12 : meal2_12,
              meal13 : meal2_13,
              meal20 : meal2_20,
              meal21 : meal2_21,
              meal22 : meal2_22,
              meal23 : meal2_23,
              meal30 : meal2_30,
              meal31 : meal2_31,
              meal32 : meal2_32,
              meal33 : meal2_33,
              meal40 : meal2_40,
              meal41 : meal2_41,
              meal42 : meal2_42,
              meal43 : meal2_43,
              meal50 : meal2_50,
              meal51 : meal2_51,
              meal52 : meal2_52,
              meal53 : meal2_53,
              meal60 : meal2_60,
              meal61 : meal2_61,
              meal62 : meal2_62,
              meal63 : meal2_63,
              updatedAt : new Date()
            }
            var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
            if(checkmeal){
              // update
              var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
            }
            else{
              var storemeal = await query.insert(usermealcoll, genmeal);
            }
          }
          
        }
        else if (updateusermeal.mealplan1 != '' && updateusermeal.goal == 2) {
          // goal 2 (1 day meal)
          var usercalories1 = updateusermeal.mealplan1;
          var usercarbs = updateusermeal.body.carbs;
          var userprotein = updateusermeal.body.protein;
          var userfat = updateusermeal.body.fat;
          var mealpercentage = updateusermeal.mealpercentage;

          var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
          //console.log("preparemealplan1",preparemealplan1);
          var userdiet = updateusermeal.diettype;
          let filter;
          if(userdiet == 1){
            filter =  { paleo: { $ne: "FALSE" } }
          }
          else if(userdiet == 2){
            filter = { mediterranean: { $ne: "FALSE" } }
          }
          else if(userdiet == 3){
            filter = { pescatarian: { $ne: "FALSE" } }
          }
          else if(userdiet == 4){
            filter = { vegan: { $ne: "FALSE" } }
          }
          else{
            filter = {}
          }

          let dietfilter;
          var finalarrplan1 = [];
          var meal10 = [];
          var meal11 = [];
          var meal12 = [];
          var meal13 = [];
          var meal20 = [];
          var meal21 = [];
          var meal22 = [];
          var meal23 = [];
          var meal30 = [];
          var meal31 = [];
          var meal32 = [];
          var meal33 = [];
          var meal40 = [];
          var meal41 = [];
          var meal42 = [];
          var meal43 = [];
          var meal50 = [];
          var meal51 = [];
          var meal52 = [];
          var meal53 = [];
          var meal60 = [];
          var meal61 = [];
          var meal62 = [];
          var meal63 = [];
          var result = [];
          const arrplan1 = preparemealplan1;

            for (let i = 0; i < arrplan1.length; i++) {
              let checkmeal = 'meal' + [i+1]
              var dynObj = {};
              dynObj[checkmeal] = "TRUE";

              dietfilter = { $and: [ filter , dynObj ] }
              //  console.log(arrplan1[i].cal);
              // console.log("dietfilter",dietfilter);

              var category = [
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              ]

                var mealVal = {
                  cal: arrplan1[i].cal,
                  carb: arrplan1[i].carb,
                  protein: arrplan1[i].protein,
                  fat: arrplan1[i].fat,
                }

                var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                var finalmeal =  meal;
                var caloriesfood = finalmeal[0].calories.grocery_list_name;
                var carbfood = finalmeal[1].carbs.grocery_list_name;
                var protinfood = finalmeal[2].proteins.grocery_list_name;
                var fatsfood = finalmeal[3].fats.grocery_list_name;
                if(checkmeal == 'meal1'){
                  meal10 = [ caloriesfood ];
                  meal11 = [ carbfood ];
                  meal12 = [ protinfood ];
                  meal13 = [ fatsfood ];
                }
                if(checkmeal == 'meal2'){
                  meal20 = [ caloriesfood ];
                  meal21 = [ carbfood ];
                  meal22 = [ protinfood ];
                  meal23 = [ fatsfood ];
                }
                if(checkmeal == 'meal3'){
                  meal30 = [ caloriesfood ];
                  meal31 = [ carbfood ];
                  meal32 = [ protinfood ];
                  meal33 = [ fatsfood ];
                }
                if(checkmeal == 'meal4'){
                  meal40 = [ caloriesfood ];
                  meal41 = [ carbfood ];
                  meal42 = [ protinfood ];
                  meal43 = [ fatsfood ];
                }
                if(checkmeal == 'meal5'){
                  meal50 = [ caloriesfood ];
                  meal51 = [ carbfood ];
                  meal52 = [ protinfood ];
                  meal53 = [ fatsfood ];
                }
                if(checkmeal == 'meal6'){
                  meal60 = [ caloriesfood ];
                  meal61 = [ carbfood ];
                  meal62 = [ protinfood ];
                  meal63 = [ fatsfood ];
                }
                finalarrplan1.push(finalmeal);

            }

          // console.log("final---1--",finalarrplan1);
          if(planDate != ""){
            dateofplan = new Date(new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0));
          }
          else{
            dateofplan = new Date(new Date(moment(new Date()).add(0, 'days')).setUTCHours(0, 0, 0, 0));
          }
          var genmeal = {
            mealplan : finalarrplan1,
            user_id : req.authenticationUser.authId,
            mealplandate : dateofplan,
            bodytype :  updateusermeal.body.bodytype,
            carbs : updateusermeal.body.carbs,
            protein : updateusermeal.body.protein,
            fat : updateusermeal.body.fat,
            workouttype : updateusermeal.workout.workouttype,
            workpercentage : updateusermeal.workout.workpercentage,
            leveltype : updateusermeal.level.leveltype,
            levelpercentage : updateusermeal.level.levelpercentage,
            weight : updateusermeal.weight,
            bodyfat : updateusermeal.bodyfat,
            bmr : updateusermeal.bmr,
            diettype : updateusermeal.diettype,
            mealpercentage : updateusermeal.mealpercentage,
            usertype : updateusermeal.gender,
            total_tdee : updateusermeal.total_tdee,
            mealplan1 : updateusermeal.mealplan1,
            mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
            mealplantype : 1,
            mealwaterdata : cups,
            total_cups_count : cups,
            usergoal : updateusermeal.goal,
            meal10 : meal10,
            meal11 : meal11,
            meal12 : meal12,
            meal13 : meal13,
            meal20 : meal20,
            meal21 : meal21,
            meal22 : meal22,
            meal23 : meal23,
            meal30 : meal30,
            meal31 : meal31,
            meal32 : meal32,
            meal33 : meal33,
            meal40 : meal40,
            meal41 : meal41,
            meal42 : meal42,
            meal43 : meal43,
            meal50 : meal50,
            meal51 : meal51,
            meal52 : meal52,
            meal53 : meal53,
            meal60 : meal60,
            meal61 : meal61,
            meal62 : meal62,
            meal63 : meal63,
            updatedAt : new Date()
          }
          var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
          if(checkmeal){
            // update
            var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
          }
          else{
            var storemeal = await query.insert(usermealcoll, genmeal);
          }

        }
        else {
          // goal 1 (1 day meal )
          var usercalories1 = updateusermeal.mealplan1;
          var usercarbs = updateusermeal.body.carbs;
          var userprotein = updateusermeal.body.protein;
          var userfat = updateusermeal.body.fat;
          var mealpercentage = updateusermeal.mealpercentage;

          var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
          //console.log("preparemealplan1--++",preparemealplan1);
          

          var userdiet = updateusermeal.diettype;
          let filter;
          if(userdiet == 1){
            filter =  { paleo: { $ne: "FALSE" } }
          }
          else if(userdiet == 2){
            filter = { mediterranean: { $ne: "FALSE" } }
          }
          else if(userdiet == 3){
            filter = { pescatarian: { $ne: "FALSE" } }
          }
          else if(userdiet == 4){
            filter = { vegan: { $ne: "FALSE" } }
          }
          else{
            filter = {}
          }
          let dietfilter;
          var finalarrplan1 = [];
          var meal10 = [];
          var meal11 = [];
          var meal12 = [];
          var meal13 = [];
          var meal20 = [];
          var meal21 = [];
          var meal22 = [];
          var meal23 = [];
          var meal30 = [];
          var meal31 = [];
          var meal32 = [];
          var meal33 = [];
          var meal40 = [];
          var meal41 = [];
          var meal42 = [];
          var meal43 = [];
          var meal50 = [];
          var meal51 = [];
          var meal52 = [];
          var meal53 = [];
          var meal60 = [];
          var meal61 = [];
          var meal62 = [];
          var meal63 = [];
          var result = [];
          const arrplan1 = preparemealplan1;

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i+1]
            var dynObj = {};
            dynObj[checkmeal] = "TRUE";
            //console.log("checkmeal--->",typeof checkmeal);
            
            dietfilter = { $and: [ filter , dynObj ] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
            ]

              var mealVal = {
                cal: arrplan1[i].cal,
                carb: arrplan1[i].carb,
                protein: arrplan1[i].protein,
                fat: arrplan1[i].fat,
              }

              var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
              var finalmeal =  meal;
              var caloriesfood = finalmeal[0].calories.grocery_list_name;
              var carbfood = finalmeal[1].carbs.grocery_list_name;
              var protinfood = finalmeal[2].proteins.grocery_list_name;
              var fatsfood = finalmeal[3].fats.grocery_list_name;
              if(checkmeal == 'meal1'){
                meal10 = [ caloriesfood ];
                meal11 = [ carbfood ];
                meal12 = [ protinfood ];
                meal13 = [ fatsfood ];
              }
              if(checkmeal == 'meal2'){
                meal20 = [ caloriesfood ];
                meal21 = [ carbfood ];
                meal22 = [ protinfood ];
                meal23 = [ fatsfood ];
              }
              if(checkmeal == 'meal3'){
                meal30 = [ caloriesfood ];
                meal31 = [ carbfood ];
                meal32 = [ protinfood ];
                meal33 = [ fatsfood ];
              }
              if(checkmeal == 'meal4'){
                meal40 = [ caloriesfood ];
                meal41 = [ carbfood ];
                meal42 = [ protinfood ];
                meal43 = [ fatsfood ];
              }
              if(checkmeal == 'meal5'){
                meal50 = [ caloriesfood ];
                meal51 = [ carbfood ];
                meal52 = [ protinfood ];
                meal53 = [ fatsfood ];
              }
              if(checkmeal == 'meal6'){
                meal60 = [ caloriesfood ];
                meal61 = [ carbfood ];
                meal62 = [ protinfood ];
                meal63 = [ fatsfood ];
              }
              finalarrplan1.push(finalmeal);
          }

        //console.log("final---1--",finalarrplan1);
        
        if(planDate != ""){
          dateofplan = new Date(new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0));
        }
        else{
          dateofplan = new Date(new Date(moment(new Date()).add(0, 'days')).setUTCHours(0, 0, 0, 0));
        }
        
          var genmeal = {
            mealplan : finalarrplan1,
            user_id : req.authenticationUser.authId,
            mealplandate : dateofplan,
            bodytype :  updateusermeal.body.bodytype,
            carbs : updateusermeal.body.carbs,
            protein : updateusermeal.body.protein,
            fat : updateusermeal.body.fat,
            workouttype : updateusermeal.workout.workouttype,
            workpercentage : updateusermeal.workout.workpercentage,
            leveltype : updateusermeal.level.leveltype,
            levelpercentage : updateusermeal.level.levelpercentage,
            weight : updateusermeal.weight,
            bodyfat : updateusermeal.bodyfat,
            bmr : updateusermeal.bmr,
            diettype : updateusermeal.diettype,
            mealpercentage : updateusermeal.mealpercentage,
            usertype : updateusermeal.gender,
            total_tdee : updateusermeal.total_tdee,
            mealplan1 : updateusermeal.mealplan1,
            mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
            mealplantype : 1,
            mealwaterdata : cups,
            total_cups_count : cups,
            usergoal : updateusermeal.goal,
            meal10 : meal10,
            meal11 : meal11,
            meal12 : meal12,
            meal13 : meal13,
            meal20 : meal20,
            meal21 : meal21,
            meal22 : meal22,
            meal23 : meal23,
            meal30 : meal30,
            meal31 : meal31,
            meal32 : meal32,
            meal33 : meal33,
            meal40 : meal40,
            meal41 : meal41,
            meal42 : meal42,
            meal43 : meal43,
            meal50 : meal50,
            meal51 : meal51,
            meal52 : meal52,
            meal53 : meal53,
            meal60 : meal60,
            meal61 : meal61,
            meal62 : meal62,
            meal63 : meal63,
            updatedAt : new Date()
          }
          var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
          if(checkmeal){
            // update
            var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
          }
          else{
            var storemeal = await query.insert(usermealcoll, genmeal);
          }

        }
      }

      else {
      // FEMALE meal breakdown in 5

        if (updateusermeal.mealplan1 != '' && updateusermeal.mealplan2 != '' && updateusermeal.goal == 3) {
          // goal - 3 (two meal plan)
          var usercalories1 = updateusermeal.mealplan1;
          var usercalories2 = updateusermeal.mealplan2;
          var usercarbs = updateusermeal.body.carbs;
          var userprotein = updateusermeal.body.protein;
          var userfat = updateusermeal.body.fat;
          var mealpercentage = updateusermeal.mealpercentage;

          var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);
          var preparemealplan2 = await UserService.preparemealplan1v2(usercalories2, usercarbs, userprotein, userfat, mealpercentage);

          var userdiet = updateusermeal.diettype;
          let filter;
          if(userdiet == 1){
            filter =  { paleo: { $ne: "FALSE" } }
          }
          else if(userdiet == 2){
            filter = { mediterranean: { $ne: "FALSE" } }
          }
          else if(userdiet == 3){
            filter = { pescatarian: { $ne: "FALSE" } }
          }
          else if(userdiet == 4){
            filter = { vegan: { $ne: "FALSE" } }
          }
          else{
            filter = {}
          }
            let dietfilter;
            var finalarrplan1 = [];
            var finalarrplan2 = [];
            var meal1_10 = [];
            var meal1_11 = [];
            var meal1_12 = [];
            var meal1_13 = [];
            var meal1_20 = [];
            var meal1_21 = [];
            var meal1_22 = [];
            var meal1_23 = [];
            var meal1_30 = [];
            var meal1_31 = [];
            var meal1_32 = [];
            var meal1_33 = [];
            var meal1_40 = [];
            var meal1_41 = [];
            var meal1_42 = [];
            var meal1_43 = [];
            var meal1_50 = [];
            var meal1_51 = [];
            var meal1_52 = [];
            var meal1_53 = [];
            var meal1_60 = [];
            var meal1_61 = [];
            var meal1_62 = [];
            var meal1_63 = [];
            var meal2_10 = [];
            var meal2_11 = [];
            var meal2_12 = [];
            var meal2_13 = [];
            var meal2_20 = [];
            var meal2_21 = [];
            var meal2_22 = [];
            var meal2_23 = [];
            var meal2_30 = [];
            var meal2_31 = [];
            var meal2_32 = [];
            var meal2_33 = [];
            var meal2_40 = [];
            var meal2_41 = [];
            var meal2_42 = [];
            var meal2_43 = [];
            var meal2_50 = [];
            var meal2_51 = [];
            var meal2_52 = [];
            var meal2_53 = [];
            var meal2_60 = [];
            var meal2_61 = [];
            var meal2_62 = [];
            var meal2_63 = [];
            var result = [];
            var arrplan1 = preparemealplan1;
            var arrplan2 = preparemealplan2;

            for (let i = 0; i < arrplan1.length; i++) {
              let checkmeal = 'meal' + [i+1]
              var dynObj = {};
              dynObj[checkmeal] = "TRUE";

              dietfilter = { $and: [ filter , dynObj ] }
              //  console.log(arrplan1[i].cal);
              // console.log("dietfilter",dietfilter);
              var category = [
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              ]

                var mealVal = {
                  cal: arrplan1[i].cal,
                  carb: arrplan1[i].carb,
                  protein: arrplan1[i].protein,
                  fat: arrplan1[i].fat,
                }

                var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                var finalmeal =  meal;
                var caloriesfood = finalmeal[0].calories.grocery_list_name;
                  var carbfood = finalmeal[1].carbs.grocery_list_name;
                  var protinfood = finalmeal[2].proteins.grocery_list_name;
                  var fatsfood = finalmeal[3].fats.grocery_list_name;
                  if(checkmeal == 'meal1'){
                    meal1_10 = [ caloriesfood ];
                    meal1_11 = [ carbfood ];
                    meal1_12 = [ protinfood ];
                    meal1_13 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal2'){
                    meal1_20 = [ caloriesfood ];
                    meal1_21 = [ carbfood ];
                    meal1_22 = [ protinfood ];
                    meal1_23 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal3'){
                    meal1_30 = [ caloriesfood ];
                    meal1_31 = [ carbfood ];
                    meal1_32 = [ protinfood ];
                    meal1_33 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal4'){
                    meal1_40 = [ caloriesfood ];
                    meal1_41 = [ carbfood ];
                    meal1_42 = [ protinfood ];
                    meal1_43 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal5'){
                    meal1_50 = [ caloriesfood ];
                    meal1_51 = [ carbfood ];
                    meal1_52 = [ protinfood ];
                    meal1_53 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal6'){
                    meal1_60 = [ caloriesfood ];
                    meal1_61 = [ carbfood ];
                    meal1_62 = [ protinfood ];
                    meal1_63 = [ fatsfood ];
                  }
                finalarrplan1.push(finalmeal);

            }

            for (let i = 0; i < arrplan2.length; i++) {
              let checkmeal = 'meal' + [i+1]
              var dynObj = {};
              dynObj[checkmeal] = "TRUE";

              dietfilter = { $and: [ filter , dynObj ] }
              //  console.log(arrplan2[i].cal);
              // console.log("dietfilter",dietfilter);
              var category = [
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              ]

                var mealVal = {
                  cal: arrplan2[i].cal,
                  carb: arrplan2[i].carb,
                  protein: arrplan2[i].protein,
                  fat: arrplan2[i].fat,
                }

                var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                var finalmeal =  meal;
                var caloriesfood = finalmeal[0].calories.grocery_list_name;
                  var carbfood = finalmeal[1].carbs.grocery_list_name;
                  var protinfood = finalmeal[2].proteins.grocery_list_name;
                  var fatsfood = finalmeal[3].fats.grocery_list_name;
                  if(checkmeal == 'meal1'){
                    meal2_10 = [ caloriesfood ];
                    meal2_11 = [ carbfood ];
                    meal2_12 = [ protinfood ];
                    meal2_13 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal2'){
                    meal2_20 = [ caloriesfood ];
                    meal2_21 = [ carbfood ];
                    meal2_22 = [ protinfood ];
                    meal2_23 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal3'){
                    meal2_30 = [ caloriesfood ];
                    meal2_31 = [ carbfood ];
                    meal2_32 = [ protinfood ];
                    meal2_33 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal4'){
                    meal2_40 = [ caloriesfood ];
                    meal2_41 = [ carbfood ];
                    meal2_42 = [ protinfood ];
                    meal2_43 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal5'){
                    meal2_50 = [ caloriesfood ];
                    meal2_51 = [ carbfood ];
                    meal2_52 = [ protinfood ];
                    meal2_53 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal6'){
                    meal2_60 = [ caloriesfood ];
                    meal2_61 = [ carbfood ];
                    meal2_62 = [ protinfood ];
                    meal2_63 = [ fatsfood ];
                  }
                finalarrplan2.push(finalmeal);

            }

          // console.log("final---1--",finalarrplan1);
          // console.log("final---2--",finalarrplan2);

          for (let i = 0; i < 3; i++) {
            if(planDate != ""){
              dateofplan = new Date(new Date(moment(planDate).add(i, 'days')).setUTCHours(0, 0, 0, 0));
            }
            else{
              dateofplan = new Date(new Date(moment(new Date()).add(i, 'days')).setUTCHours(0, 0, 0, 0));
            }
            var genmeal = {
              mealplan : finalarrplan1,
              user_id : req.authenticationUser.authId,
              mealplandate : dateofplan,
              bodytype :  updateusermeal.body.bodytype,
              carbs : updateusermeal.body.carbs,
              protein : updateusermeal.body.protein,
              fat : updateusermeal.body.fat,
              workouttype : updateusermeal.workout.workouttype,
              workpercentage : updateusermeal.workout.workpercentage,
              leveltype : updateusermeal.level.leveltype,
              levelpercentage : updateusermeal.level.levelpercentage,
              weight : updateusermeal.weight,
              bodyfat : updateusermeal.bodyfat,
              bmr : updateusermeal.bmr,
              diettype : updateusermeal.diettype,
              mealpercentage : updateusermeal.mealpercentage,
              usertype : updateusermeal.gender,
              total_tdee : updateusermeal.total_tdee,
              mealplan1 : updateusermeal.mealplan1,
              mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
              mealplantype : 1,
              mealwaterdata : cups,
              total_cups_count : cups,
              usergoal : updateusermeal.goal,
              meal10 : meal1_10,
                meal11 : meal1_11,
                meal12 : meal1_12,
                meal13 : meal1_13,
                meal20 : meal1_20,
                meal21 : meal1_21,
                meal22 : meal1_22,
                meal23 : meal1_23,
                meal30 : meal1_30,
                meal31 : meal1_31,
                meal32 : meal1_32,
                meal33 : meal1_33,
                meal40 : meal1_40,
                meal41 : meal1_41,
                meal42 : meal1_42,
                meal43 : meal1_43,
                meal50 : meal1_50,
                meal51 : meal1_51,
                meal52 : meal1_52,
                meal53 : meal1_53,
                meal60 : meal1_60,
                meal61 : meal1_61,
                meal62 : meal1_62,
                meal63 : meal1_63,
              updatedAt : new Date()
            }
            var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
            if(checkmeal){
              // update
              var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
            }
            else{
              var storemeal = await query.insert(usermealcoll, genmeal);
            }
          }

          for (let i = 0; i < 1; i++) {
            if(planDate != ""){
              dateofplan = new Date(new Date(moment(planDate).add(3, 'days')).setUTCHours(0, 0, 0, 0));
            }
            else{
              dateofplan = new Date(new Date(moment(new Date()).add(3, 'days')).setUTCHours(0, 0, 0, 0));
            }
            var genmeal = {
              mealplan : finalarrplan2,
              user_id : req.authenticationUser.authId,
              mealplandate : dateofplan,
              bodytype :  updateusermeal.body.bodytype,
              carbs : updateusermeal.body.carbs,
              protein : updateusermeal.body.protein,
              fat : updateusermeal.body.fat,
              workouttype : updateusermeal.workout.workouttype,
              workpercentage : updateusermeal.workout.workpercentage,
              leveltype : updateusermeal.level.leveltype,
              levelpercentage : updateusermeal.level.levelpercentage,
              weight : updateusermeal.weight,
              bodyfat : updateusermeal.bodyfat,
              bmr : updateusermeal.bmr,
              diettype : updateusermeal.diettype,
              mealpercentage : updateusermeal.mealpercentage,
              usertype : updateusermeal.gender,
              total_tdee : updateusermeal.total_tdee,
              mealplan1 : updateusermeal.mealplan1,
              mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
              mealplantype : 2,
              mealwaterdata : cups,
              total_cups_count : cups,
              usergoal : updateusermeal.goal,
              meal10 : meal2_10,
                meal11 : meal2_11,
                meal12 : meal2_12,
                meal13 : meal2_13,
                meal20 : meal2_20,
                meal21 : meal2_21,
                meal22 : meal2_22,
                meal23 : meal2_23,
                meal30 : meal2_30,
                meal31 : meal2_31,
                meal32 : meal2_32,
                meal33 : meal2_33,
                meal40 : meal2_40,
                meal41 : meal2_41,
                meal42 : meal2_42,
                meal43 : meal2_43,
                meal50 : meal2_50,
                meal51 : meal2_51,
                meal52 : meal2_52,
                meal53 : meal2_53,
                meal60 : meal2_60,
                meal61 : meal2_61,
                meal62 : meal2_62,
                meal63 : meal2_63,
              updatedAt : new Date()
            }
            var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
            if(checkmeal){
              // update
              var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
            }
            else{
              var storemeal = await query.insert(usermealcoll, genmeal);
            }
          }


        }
        else if (updateusermeal.mealplan1 != '' && updateusermeal.goal == 2) {
          // goal plan 2 (1 day meal)
          var usercalories1 = updateusermeal.mealplan1;
          var usercarbs = updateusermeal.body.carbs;
          var userprotein = updateusermeal.body.protein;
          var userfat = updateusermeal.body.fat;
          var mealpercentage = updateusermeal.mealpercentage;

          var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);

          var userdiet = updateusermeal.diettype;
          let filter;
          if(userdiet == 1){
            filter =  { paleo: { $ne: "FALSE" } }
          }
          else if(userdiet == 2){
            filter = { mediterranean: { $ne: "FALSE" } }
          }
          else if(userdiet == 3){
            filter = { pescatarian: { $ne: "FALSE" } }
          }
          else if(userdiet == 4){
            filter = { vegan: { $ne: "FALSE" } }
          }
          else{
            filter = {}
          }

          let dietfilter;
          var finalarrplan1 = [];
          var meal10 = [];
            var meal11 = [];
            var meal12 = [];
            var meal13 = [];
            var meal20 = [];
            var meal21 = [];
            var meal22 = [];
            var meal23 = [];
            var meal30 = [];
            var meal31 = [];
            var meal32 = [];
            var meal33 = [];
            var meal40 = [];
            var meal41 = [];
            var meal42 = [];
            var meal43 = [];
            var meal50 = [];
            var meal51 = [];
            var meal52 = [];
            var meal53 = [];
            var meal60 = [];
            var meal61 = [];
            var meal62 = [];
            var meal63 = [];
          var result = [];
          const arrplan1 = preparemealplan1;

            for (let i = 0; i < arrplan1.length; i++) {
              let checkmeal = 'meal' + [i+1]
              var dynObj = {};
              dynObj[checkmeal] = "TRUE";

              dietfilter = { $and: [ filter , dynObj ] }
              //  console.log(arrplan1[i].cal);
              // console.log("dietfilter",dietfilter);
              var category = [
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
                { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              ]

                var mealVal = {
                  cal: arrplan1[i].cal,
                  carb: arrplan1[i].carb,
                  protein: arrplan1[i].protein,
                  fat: arrplan1[i].fat,
                }

                var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
                var finalmeal =  meal;
                var caloriesfood = finalmeal[0].calories.grocery_list_name;
                  var carbfood = finalmeal[1].carbs.grocery_list_name;
                  var protinfood = finalmeal[2].proteins.grocery_list_name;
                  var fatsfood = finalmeal[3].fats.grocery_list_name;
                  if(checkmeal == 'meal1'){
                    meal10 = [ caloriesfood ];
                    meal11 = [ carbfood ];
                    meal12 = [ protinfood ];
                    meal13 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal2'){
                    meal20 = [ caloriesfood ];
                    meal21 = [ carbfood ];
                    meal22 = [ protinfood ];
                    meal23 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal3'){
                    meal30 = [ caloriesfood ];
                    meal31 = [ carbfood ];
                    meal32 = [ protinfood ];
                    meal33 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal4'){
                    meal40 = [ caloriesfood ];
                    meal41 = [ carbfood ];
                    meal42 = [ protinfood ];
                    meal43 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal5'){
                    meal50 = [ caloriesfood ];
                    meal51 = [ carbfood ];
                    meal52 = [ protinfood ];
                    meal53 = [ fatsfood ];
                  }
                  if(checkmeal == 'meal6'){
                    meal60 = [ caloriesfood ];
                    meal61 = [ carbfood ];
                    meal62 = [ protinfood ];
                    meal63 = [ fatsfood ];
                  }
                finalarrplan1.push(finalmeal);

            }

          // console.log("final---1--",finalarrplan1);
          if(planDate != ""){
            dateofplan = new Date(new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0));
          }
          else{
            dateofplan = new Date(new Date(moment(new Date()).add(0, 'days')).setUTCHours(0, 0, 0, 0));
          }
            var genmeal = {
              mealplan : finalarrplan1,
              user_id : req.authenticationUser.authId,
              mealplandate : dateofplan,
              bodytype :  updateusermeal.body.bodytype,
              carbs : updateusermeal.body.carbs,
              protein : updateusermeal.body.protein,
              fat : updateusermeal.body.fat,
              workouttype : updateusermeal.workout.workouttype,
              workpercentage : updateusermeal.workout.workpercentage,
              leveltype : updateusermeal.level.leveltype,
              levelpercentage : updateusermeal.level.levelpercentage,
              weight : updateusermeal.weight,
              bodyfat : updateusermeal.bodyfat,
              bmr : updateusermeal.bmr,
              diettype : updateusermeal.diettype,
              mealpercentage : updateusermeal.mealpercentage,
              usertype : updateusermeal.gender,
              total_tdee : updateusermeal.total_tdee,
              mealplan1 : updateusermeal.mealplan1,
              mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
              mealplantype : 1,
              mealwaterdata : cups,
              total_cups_count : cups,
              usergoal : updateusermeal.goal,
              meal10 : meal10,
              meal11 : meal11,
              meal12 : meal12,
              meal13 : meal13,
              meal20 : meal20,
              meal21 : meal21,
              meal22 : meal22,
              meal23 : meal23,
              meal30 : meal30,
              meal31 : meal31,
              meal32 : meal32,
              meal33 : meal33,
              meal40 : meal40,
              meal41 : meal41,
              meal42 : meal42,
              meal43 : meal43,
              meal50 : meal50,
              meal51 : meal51,
              meal52 : meal52,
              meal53 : meal53,
              meal60 : meal60,
              meal61 : meal61,
              meal62 : meal62,
              meal63 : meal63,
              updatedAt : new Date()
            }
            var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
            if(checkmeal){
              // update
              var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
            }
            else{
              var storemeal = await query.insert(usermealcoll, genmeal);
            }


        }
        else {
          // goal 3 (1 day meal )
          var usercalories1 = updateusermeal.mealplan1;
          var usercarbs = updateusermeal.body.carbs;
          var userprotein = updateusermeal.body.protein;
          var userfat = updateusermeal.body.fat;
          var mealpercentage = updateusermeal.mealpercentage;

          var preparemealplan1 = await UserService.preparemealplan1v2(usercalories1, usercarbs, userprotein, userfat, mealpercentage);

          var userdiet = updateusermeal.diettype;
          let filter;
          if(userdiet == 1){
            filter =  { paleo: { $ne: "FALSE" } }
          }
          else if(userdiet == 2){
            filter = { mediterranean: { $ne: "FALSE" } }
          }
          else if(userdiet == 3){
            filter = { pescatarian: { $ne: "FALSE" } }
          }
          else if(userdiet == 4){
            filter = { vegan: { $ne: "FALSE" } }
          }
          else{
            filter = {}
          }
          let dietfilter;
          var finalarrplan1 = [];
          var meal1 = [];
          var meal10 = [];
          var meal11 = [];
          var meal12 = [];
          var meal13 = [];
          var meal20 = [];
          var meal21 = [];
          var meal22 = [];
          var meal23 = [];
          var meal30 = [];
          var meal31 = [];
          var meal32 = [];
          var meal33 = [];
          var meal40 = [];
          var meal41 = [];
          var meal42 = [];
          var meal43 = [];
          var meal50 = [];
          var meal51 = [];
          var meal52 = [];
          var meal53 = [];
          var meal60 = [];
          var meal61 = [];
          var meal62 = [];
          var meal63 = [];
          var result = [];
          const arrplan1 = preparemealplan1;

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i+1]
            var dynObj = {};
            dynObj[checkmeal] = "TRUE";

            dietfilter = { $and: [ filter , dynObj ] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"Carb, Fruit"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
              { 0:"Protein", 1:"Carb", 2:"Fats", 3:"F-Carb"},
            ]

              var mealVal = {
                cal: arrplan1[i].cal,
                carb: arrplan1[i].carb,
                protein: arrplan1[i].protein,
                fat: arrplan1[i].fat,
              }

              var meal = await UserService.getmeal(dietfilter, mealVal,category[i]);
              var finalmeal =  meal;
              var caloriesfood = finalmeal[0].calories.grocery_list_name;
                var carbfood = finalmeal[1].carbs.grocery_list_name;
                var protinfood = finalmeal[2].proteins.grocery_list_name;
                var fatsfood = finalmeal[3].fats.grocery_list_name;
                if(checkmeal == 'meal1'){
                  meal10 = [ caloriesfood ];
                  meal11 = [ carbfood ];
                  meal12 = [ protinfood ];
                  meal13 = [ fatsfood ];
                }
                if(checkmeal == 'meal2'){
                  meal20 = [ caloriesfood ];
                  meal21 = [ carbfood ];
                  meal22 = [ protinfood ];
                  meal23 = [ fatsfood ];
                }
                if(checkmeal == 'meal3'){
                  meal30 = [ caloriesfood ];
                  meal31 = [ carbfood ];
                  meal32 = [ protinfood ];
                  meal33 = [ fatsfood ];
                }
                if(checkmeal == 'meal4'){
                  meal40 = [ caloriesfood ];
                  meal41 = [ carbfood ];
                  meal42 = [ protinfood ];
                  meal43 = [ fatsfood ];
                }
                if(checkmeal == 'meal5'){
                  meal50 = [ caloriesfood ];
                  meal51 = [ carbfood ];
                  meal52 = [ protinfood ];
                  meal53 = [ fatsfood ];
                }
                if(checkmeal == 'meal6'){
                  meal60 = [ caloriesfood ];
                  meal61 = [ carbfood ];
                  meal62 = [ protinfood ];
                  meal63 = [ fatsfood ];
                }
              finalarrplan1.push(finalmeal);

          }

        // console.log("final---1--",finalarrplan1);
        if(planDate != ""){
          dateofplan = new Date(new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0));
        }
        else{
          dateofplan = new Date(new Date(moment(new Date()).add(0, 'days')).setUTCHours(0, 0, 0, 0));
        }
        var genmeal = {
          mealplan : finalarrplan1,
          user_id : req.authenticationUser.authId,
          mealplandate : dateofplan,
          bodytype :  updateusermeal.body.bodytype,
          carbs : updateusermeal.body.carbs,
          protein : updateusermeal.body.protein,
          fat : updateusermeal.body.fat,
          workouttype : updateusermeal.workout.workouttype,
          workpercentage : updateusermeal.workout.workpercentage,
          leveltype : updateusermeal.level.leveltype,
          levelpercentage : updateusermeal.level.levelpercentage,
          weight : updateusermeal.weight,
          bodyfat : updateusermeal.bodyfat,
          bmr : updateusermeal.bmr,
          diettype : updateusermeal.diettype,
          mealpercentage : updateusermeal.mealpercentage,
          usertype : updateusermeal.gender,
          total_tdee : updateusermeal.total_tdee,
          mealplan1 : updateusermeal.mealplan1,
          mealplan2 : updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
          mealplantype : 1,
          mealwaterdata : cups,
          total_cups_count : cups,
          usergoal : updateusermeal.goal,
          meal10 : meal10,
          meal11 : meal11,
          meal12 : meal12,
          meal13 : meal13,
          meal20 : meal20,
          meal21 : meal21,
          meal22 : meal22,
          meal23 : meal23,
          meal30 : meal30,
          meal31 : meal31,
          meal32 : meal32,
          meal33 : meal33,
          meal40 : meal40,
          meal41 : meal41,
          meal42 : meal42,
          meal43 : meal43,
          meal50 : meal50,
          meal51 : meal51,
          meal52 : meal52,
          meal53 : meal53,
          meal60 : meal60,
          meal61 : meal61,
          meal62 : meal62,
          meal63 : meal63,
          updatedAt : new Date()
        }
        var checkmeal = await query.findOne(usermealcoll, { $and: [ { user_id : req.authenticationUser.authId }, { mealplandate : dateofplan } ] })
        if(checkmeal){
          // update
          var storemeal = await query.findOneAndUpdate(usermealcoll, { _id : checkmeal._id }, { $set : genmeal })
        }
        else{
          var storemeal = await query.insert(usermealcoll, genmeal);
        }

        }

      }

      return responseModel.successResponse("User meal generated successfully.");
    }
    else {
      return responseModel.failResponse("Error while genrating meal");
    }

  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message;
    return responseModel.failResponse("Error while genrating meal: " + errMessage);
  }
}