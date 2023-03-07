var komponentes = {
    num_of_rows : 12, //rindu skaits
    num_of_cols : 24, //kollonu skaits
    num_of_bombs : 55, //bumbu skaits
    bomb : '💣', //bumbu simbols
    flagSymbol : '🚩', //karodziņa simbols
    alive : "sakums", //"alive" stāvoklis
    colors : {1: 'blue', 2: 'green', 3: 'red', 4: 'purple', 5: 'maroon', 6: 'turquoise', 7: 'black', 8: 'grey'} //ciparu krāsa atkarībā no apkārtesošo bumbu skaita
}


let Interval; 
    window.onload = function () {  //funkcija izdzēš iepriekšesamo "interval" un aizstāj to ar jaunu, pie viena sagatavojot hronometru
      clearInterval(Interval); 
       Interval = setInterval(startTimer, 10); //izveidots "interval" un uzsākts hronometrs

        var seconds = 00; 
        var tens = 00; 
        var minutes = 00;
        var appendTens = document.getElementById("tens")
        var appendSeconds = document.getElementById("seconds")
        var appendMinutes = document.getElementById("minutes")

    function startTimer () { //funkcija uzsāk hronometra skaitīšanu un turpina skaitīt bezgalīgi
        
        if (komponentes.alive=="spele"){
            tens++; 
            
            
            if (tens <= 9){
                appendTens.innerHTML = "0" + tens;
            }
            
            if (tens > 9){
                appendTens.innerHTML = tens;
            } 
            
            if (tens > 99) {
                console.log("seconds");
                seconds++;
                appendSeconds.innerHTML = "0" + seconds;
                tens = 0;
                appendTens.innerHTML = "0" + 0;
            }
            
            if (seconds > 9){
                appendSeconds.innerHTML = seconds;
            }

            if (seconds > 59){
                console.log("minutes");
                minutes++;
                appendMinutes.innerHTML = "0" + minutes;
                seconds = 0;
                appendSeconds.innerHTML = "0" + 0;
            }
        }
    }
}
  

    function startGame() { //komanda uzsāk spēli
    
            komponentes.bombs = placeBombs(); //komanda novieto bumbas
            document.getElementById('field').appendChild(createTable()); //tiek paņemts laukums un tajā ievietotas bumbas
    }


    function placeBombs() { //komanda novieto bumbas laukumā
        var i, rows = [];
    
        for (i=0; i<komponentes.num_of_bombs; i++) {
            placeSingleBomb(rows); //ar mainīgo i kā rindas, tiek izvietotas bumbas
        }
        return rows;
    } 


    function placeSingleBomb(bombs) { //komanda novieto vienu bumbu

        var nrow, ncol, row, col;
        nrow = Math.floor(Math.random() * komponentes.num_of_rows); //izmantojot math.random tiek nejauši novietotas bumbas pa visām rindām
        ncol = Math.floor(Math.random() * komponentes.num_of_cols); //izmantojot math.random tiek nejauši novietotas bumbas pa visām kollonām
        row = bombs[nrow];
    
        if (!row) {
            row = [];
            bombs[nrow] = row;
        }
    
        col = row[ncol];
    
        if (!col) {
            row[ncol] = true;
            return
        } 
        else {
            placeSingleBomb(bombs); //komanda novieto vienu bumbu
        }
    }


    function cellID(i, j) { //komanda iedod šūnai ID
        return 'cell-' + i + '-' + j;
    }


    function createTable() { //komanda izveido spēles laukumu
        var table, row, td, i, j;
        table = document.createElement('table');
    
        for (i=0; i<komponentes.num_of_rows; i++) { //tiek izveidoti tr elementi katrai rindai
            row = document.createElement('tr');
            for (j=0; j<komponentes.num_of_cols; j++) { //tiek izveidoti td elementi katrai kollonai
                td = document.createElement('td');
                td.id = cellID(i, j);
                row.appendChild(td);
                addCellListeners(td, i, j); //tiek pievienoti celllisteners kas noteiks šūnu stāvokli
            }
            table.appendChild(row);
        }
        return table;
    }


    function addCellListeners(td, i, j) { //tiek pievienoti celllisteneri, lai piespiežot uz šūnu tabulā, tā veiktu funkciju
        td.addEventListener('mousedown', function(event) { //kad peles klikšķis tiek piespiests, tiek iekrāsota šūna un pārbaudīts vai spēle nav jābeidz
            if (komponentes.alive == "beigas") {
                return;
            }
            komponentes.alive = "spele"
            komponentes.mousewhiches += event.which;
            if (event.which === 3) {
                return;
            }
            if (this.flagged) {
                return;
            }
            this.style.backgroundColor = 'lightGrey';
        });

        td.addEventListener('mouseup', function(event) { //kad peles klikšķis tiek atlaists, pārbauda vai spēle jābeidz vai jāturpina, un vai jāveic massClick
      
            if (!komponentes.alive) {
                return;
            }

            if (this.clicked && komponentes.mousewhiches == 4) { //ja blakus nav bumbu, tiek veikts massClick
                performMassClick(this, i, j);
            }

            komponentes.mousewhiches = 0;
        
            if (event.which === 3) {
           
                if (this.clicked) {
                    return;
                }
                if (this.flagged) {
                    this.flagged = false;
                    this.textContent = '';
                } else {
                    this.flagged = true;
                    this.textContent = komponentes.flagSymbol;
                }

                event.preventDefault(); //ja ir notikusi kāda kļūme, kods neturpinās strādāt šajā vietā līdz "stopPropogation" punktam
                event.stopPropagation(); //šeit atceļas iepriekš nosacītais punkts
          
                return false;
            } 
            else {
                handleCellClick(this, i, j); //handleCellClick pārbauda šūnas "drošību"
            }
        });

        td.oncontextmenu = function() { //funkcija kas nosaka kas notiek kad html elements tiek piespiests ar labo peles klikšķi
            return false; 
        };

        td.addEventListener('rightclick', function(event){ //pievienots addeventlistener priekš labā peles klikšķa, kas novieto karodziņu šūnā
            if (!komponentes.alive) {
                return;
            }
            if (this.clicked) {
                this.textContent = komponentes.flagSymbol;
            }
            else {
                return false;
            }
        });
    }


    function handleCellClick(cell, i, j) { //komanda pārbauda vai piespiestā šūna ir droša
        if (!komponentes.alive) {
            return;
        }

        if (cell.flagged) {
            return;
        }

        cell.clicked = true;

        if (komponentes.bombs[i][j]) {
            cell.style.color = 'red';
            cell.textContent = komponentes.bomb;
            gameOver(); //funkcija kas nobeidz spēli
        
        }
        else {
            cell.style.backgroundColor = 'lightGrey';
            num_of_bombs = adjacentBombs(i, j);
            if (num_of_bombs) {
                cell.style.color = komponentes.colors[num_of_bombs];
                cell.textContent = num_of_bombs;
            } 
            else {
                clickAdjacentBombs(i, j);
            }
        }
    }


    function adjacentBombs(row, col) { //komanda parbauda blakusesošās bumbas
        var i, j, num_of_bombs;
        num_of_bombs = 0;

        for (i=-1; i<2; i++) {
            for (j=-1; j<2; j++) {
                if (komponentes.bombs[row + i] && komponentes.bombs[row + i][col + j]) {
                    num_of_bombs++;
                }
            }
        }
        return num_of_bombs;
    }


    function adjacentFlags(row, col) { //komanda pārbauda blakusesošās drošās šūnas
        var i, j, num_flags;
        num_flags = 0;

        for (i=-1; i<2; i++) {
            for (j=-1; j<2; j++) {
                cell = document.getElementById(cellID(row + i, col + j));
                if (!!cell && cell.flagged) {
                    num_flags++;
                }
            }
        }
        return num_flags;
    }


    function clickAdjacentBombs(row, col) { //komanda attīra blakusesošās šūnas, kuras ir drošas
        var i, j, cell;
    
        for (i=-1; i<2; i++) {
            for (j=-1; j<2; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                cell = document.getElementById(cellID(row + i, col + j)); //tiek paņemta noteikta šūna
                if (!!cell && !cell.clicked && !cell.flagged) {
                    handleCellClick(cell, row + i, col + j); //tiek pārbaudīta šūna
                }
            }
        }
    }


    function performMassClick(cell, row, col) { //komanda veic lielu klikšķi, kas atklāj lielāku spēles zonu
        if (adjacentFlags(row, col) === adjacentBombs(row, col)) {
            clickAdjacentBombs(row, col);
        }
    }


    function gameOver() { //komanda liek spēlei apstāties
        komponentes.alive = false;
        document.getElementById('lost').style.display="block";
        clearInterval(Interval);
    }


    function parladetLapu(){ //komanda pārlādē vietni
        window.location.reload();
    }

    
    window.addEventListener('load', function() { //komanda, kas nostrādā kad tiek atvērta vietne
        document.getElementById('lost').style.display="none";
        startGame();
    });