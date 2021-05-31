const dotMatrix = document.querySelector("#dotMatrix")

const smith = document.querySelector("#smith");
const needleman = document.querySelector("#needle");
const algo = document.querySelector("#algo");

needleman.addEventListener("click", () => {
    algo.innerHTML="";
    let dna1 = prompt("enter dna 1").toString().toUpperCase();
    let dna2 = prompt("enter dna 2").toString().toUpperCase();
    let matchScore = Number(prompt("enter match score"));
    let mismatchPenalty = Number(prompt("enter mismatch penalty"));
    let gapPenalty = Number(prompt("enter gap penalty"));
    const { matrix, aligments } = calculateNeedlemanWunch(dna1,dna2,matchScore, mismatchPenalty, gapPenalty);
    drawMatrix(matrix);
    printAlignments(aligments);
})

dotMatrix.addEventListener("click", () => {
    algo.innerHTML = "";
    let dna1 = prompt("enter dna 1").toString().toUpperCase();
    let dna2 = prompt("enter dna 2").toString().toUpperCase();
    let windowSize = Number(prompt("enter window size"));
    let step = Number(prompt("enter step size"));
    let threshold = Number(prompt("enter threshold"));

    const matrix = calculateDotMatrix(dna1, dna2, windowSize,step,threshold);
    drawMatrix(matrix);
});




smith.addEventListener("click", ()=>{
    algo.innerHTML="";
    let dna1 = prompt("enter dna 1").toString().toUpperCase();
    let dna2 = prompt("enter dna 2").toString().toUpperCase();
    let matchScore = Number(prompt("enter match score"));
    let mismatchPenalty = Number(prompt("enter mismatch penalty"));
    let gapPenalty = Number(prompt("enter gap penalty"));
    const { matrix, aligments } = calculateSmithWaterman(dna1 , dna2, matchScore, mismatchPenalty, gapPenalty);
    drawMatrix(matrix);
    printAlignments(aligments);
});
 

function calculateDotMatrix(dna1 , dna2, window, step, threshold) {
    let myArr = fillArr(dna1, dna2);
    let count = 0;


    for (let i = 1; i <= myArr.length - window; i += step) {
        for (let j = 1; j <= myArr[0].length - window; j += step) {
            count = 0;
            for (let k = 0; k < window; k++) {

                if (myArr[k + i][0] === myArr[0][k + j]) {
                    count++;
                }
            }
            if (count >= threshold) {
                myArr[Math.floor(window / 2) + i][Math.floor(window / 2) + j] = "X";
            }
        }
    }

    return myArr;

}


function calculateNeedlemanWunch(dna1, dna2, matchScore, mismatchPenalty, gapPenalty) {
    fillArr(dna1, dna2);
    let intermadiateScores = [];
    let scoreMatrix = [];
    let tracebackMatrix = [];
    //let finalAlignments = [];


    scoreMatrix.push([0]);
    intermadiateScores.push([[null, null, null]]);
    tracebackMatrix.push([[false, false, false]]);

    for (let i = 1; i < dna2.length + 1; i++) {       //check for loop here
        scoreMatrix[0].push(scoreMatrix[0][scoreMatrix[0].length - 1] + gapPenalty);
        intermadiateScores[0].push([null, null, null]);
        tracebackMatrix[0].push([true, false, false]);
    }


    for (let i = 1; i < dna1.length + 1; i++) {
        scoreMatrix.push([scoreMatrix[i - 1][0] + gapPenalty]);
        intermadiateScores.push([[null, null, null]]);
        tracebackMatrix.push([[false, false, true]]);


        for (let j = 1; j < dna2.length + 1; j++) {     //calculating all possible scores
            const insert_score = scoreMatrix[i][j - 1] + gapPenalty;
            const delete_score = scoreMatrix[i - 1][j] + gapPenalty;
            // similarity
            let similarity_score;
            if (dna1[i - 1] === dna2[j - 1]) {
                similarity_score = matchScore;
            } else {
                similarity_score = mismatchPenalty;
            }


            const match = scoreMatrix[i - 1][j - 1] + similarity_score;
            const cell_intermediate_scores = [insert_score, match, delete_score];
            const cell_best_score = Math.max(...cell_intermediate_scores);
            const tracebackTypeStatus = cell_intermediate_scores.map((e, i) => e === cell_best_score);     //storing alignment type
            scoreMatrix[i].push(cell_best_score);
            intermadiateScores[i].push(cell_intermediate_scores);
            tracebackMatrix[i].push(tracebackTypeStatus);

        }

    }

    function childrenAlignment(position) {
        let i, j, children;
        [i, j] = position;
        children = [];

        const position_traceback_type_status = tracebackMatrix[i][j];
        if (position_traceback_type_status[0]) {
            children.push({ pos: [i, j - 1], tracebackType: 0 });
        }
        if (position_traceback_type_status[1]) {
            children.push({ pos: [i - 1, j - 1], tracebackType: 1 });
        }
        if (position_traceback_type_status[2]) {
            children.push({ pos: [i - 1, j], tracebackType: 2 });
        }

        return children;

    }


    function tracebackAlignment() {
        let finalAlignments = [];
        let startCell = {
            next: null,
            pos: [dna1.length, dna2.length],
            aligment: {
                sequence1: "",
                sequence2: ""
            }
        };

        let currentCell, child, currentChildren, len, depth, currentAlignment, currentPos, i;

        currentCell = startCell;

        while (currentCell) {
            currentPos = currentCell.pos;
            currentAlignment = currentCell.aligment;

            currentChildren = childrenAlignment(currentCell.pos);

            if (!currentChildren.length) {
                finalAlignments.push(currentAlignment);
            }

            currentCell = currentCell.next;

            for (i = 0, len = currentChildren.length; i < len; i++) {
                child = currentChildren[i];
                child.aligment = {
                    sequence1: currentAlignment.sequence1.concat(child.tracebackType === 0 ? "_" : dna1[currentPos[0] - 1]),
                    sequence2: currentAlignment.sequence2.concat(child.tracebackType === 2 ? "_" : dna2[currentPos[1] - 1])
                };
                child.next = currentCell;
                currentCell = child;
            }

        }



        return finalAlignments;
    }

    const myArr = tracebackAlignment();
    let returnObject = {
        aligments: myArr,
        matrix: scoreMatrix
    };
    for (let i = 0; i < myArr.length; i++) {
        myArr[i].sequence1 = reverseString(myArr[i].sequence1);
        myArr[i].sequence2 = reverseString(myArr[i].sequence2);
    }

    //console.log(scoreMatrix);
    //console.log(intermadiateScores)
    //console.log(tracebackMatrix);
    return (returnObject);


}

function calculateSmithWaterman(dna1, dna2, matchScore, mismatchPenalty, gapPenalty) {
    fillArr(dna1, dna2);
    let intermadiateScores = [];
    let scoreMatrix = [];
    let tracebackMatrix = [];

    let maxScores = [{
        max: 0,
        position: {
            i: 0,
            j: 0
        }
    }]
    


    scoreMatrix.push([0]);
    intermadiateScores.push([[null, null, null]]);
    tracebackMatrix.push([[false, false, false]]);

    for (let i = 1; i < dna2.length + 1; i++) {       
        scoreMatrix[0].push(0);
        intermadiateScores[0].push([null, null, null]);
        tracebackMatrix[0].push([true, false, false]);
    }


    for (let i = 1; i < dna1.length + 1; i++) {
        scoreMatrix.push([0]);
        intermadiateScores.push([[null, null, null]]);
        tracebackMatrix.push([[false, false, true]]);


        for (let j = 1; j < dna2.length + 1; j++) {     //calculating all possible scores
            const insert_score = scoreMatrix[i][j - 1] + gapPenalty;
            const delete_score = scoreMatrix[i - 1][j] + gapPenalty;
            // similarity
            let similarity_score;
            if (dna1[i - 1] === dna2[j - 1]) {
                similarity_score = matchScore;
            } else {
                similarity_score = mismatchPenalty;
            }


            const match = scoreMatrix[i - 1][j - 1] + similarity_score;
            const cell_intermediate_scores = [insert_score, match, delete_score];
            const cell_best_score = Math.max(...cell_intermediate_scores, 0);
            const tracebackTypeStatus = cell_intermediate_scores.map((e, i) => e === cell_best_score);     //storing alignment type
            scoreMatrix[i].push(cell_best_score);
            intermadiateScores[i].push(cell_intermediate_scores);
            tracebackMatrix[i].push(tracebackTypeStatus);

            if (maxScores[0].max < cell_best_score) {
                maxScores = [{
                    max: cell_best_score,
                    position: {
                        i: i,
                        j: j
                    }
                }]
            }
            else if (maxScores[0].max === cell_best_score) {
                maxScores.push({
                    max: cell_best_score,
                    position: {
                        i: i,
                        j: j
                    }
                })
            }

        }

    }

    function childrenAlignment(position) {
        let i, j, children;
        [i, j] = position;
        children = [];

        const position_traceback_type_status = tracebackMatrix[i][j];
        if (position_traceback_type_status[0]) {
            children.push({ pos: [i, j - 1], tracebackType: 0 });
        }
        if (position_traceback_type_status[1]) {
            children.push({ pos: [i - 1, j - 1], tracebackType: 1 });
        }
        if (position_traceback_type_status[2]) {
            children.push({ pos: [i - 1, j], tracebackType: 2 });
        }

        return children;

    }


    function tracebackAlignment() {

        let finalAlignments = [];

        for (let k = 0; k < maxScores.length; k++) {


            let startCell = {
                next: null,
                pos: [maxScores[k].position.i, maxScores[k].position.j],
                aligment: {
                    sequence1: "",
                    sequence2: ""
                }
            };

            let currentCell, child, currentChildren, len, depth, currentAlignment, currentPos, i;

            currentCell = startCell;

            while (currentCell) {
                currentPos = currentCell.pos;
                currentAlignment = currentCell.aligment;

                currentChildren = childrenAlignment(currentCell.pos);

                if (!currentChildren.length) {

                    const seq1 = currentAlignment.sequence1.replace(/_+$/g, '');
                    const seq2 = currentAlignment.sequence2.replace(/_+$/g, '');
                    const minLength = Math.min(seq1.length, seq2.length)





                    currentAlignment.sequence1 = seq1.slice(0, minLength)
                    currentAlignment.sequence2 = seq2.slice(0, minLength)
                    finalAlignments.push(currentAlignment);

                }

                currentCell = currentCell.next;

                for (i = 0, len = currentChildren.length; i < len; i++) {
                    child = currentChildren[i];
                    child.aligment = {
                        sequence1: currentAlignment.sequence1.concat(child.tracebackType === 0 ? "_" : dna1[currentPos[0] - 1]),
                        sequence2: currentAlignment.sequence2.concat(child.tracebackType === 2 ? "_" : dna2[currentPos[1] - 1])
                    };
                    child.next = currentCell;
                    currentCell = child;
                }

            }


        }



        return finalAlignments;
    }

    const myArr = tracebackAlignment();


    for (let i = 0; i < myArr.length; i++) {
        myArr[i].sequence1 = reverseString(myArr[i].sequence1);
        myArr[i].sequence2 = reverseString(myArr[i].sequence2);
    }

    let returnObject = {
        aligments: myArr,
        matrix: scoreMatrix
    }

    //console.log(scoreMatrix);
    //console.log(intermadiateScores)
    //console.log(tracebackMatrix);
    return (returnObject);


}







function fillArr(dna1, dna2) {
    let arr = [];
    for (let i = 0; i < dna1.length + 1; i++) {
        arr.push([]);
    }

    arr[0].push(null, ...dna2.split(""));
    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < arr[0].length; j++) {
            if (j == 0) {
                arr[i].push(dna1[i - 1]);
            } else {
                arr[i].push(null);
            }
        }
    }

    return arr;
}



function drawMatrix(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('div')

        for (let j = 0; j < matrix[0].length; j++) {

            const cell = document.createElement('span');
            if (matrix[i][j] !== null) {

                cell.innerText = ` ${matrix[i][j]} `;
            }
            else {
                cell.innerText = "-";
            }

            row.appendChild(cell);

        }
        algo.appendChild(row);
    }
}

function reverseString(str) {
    let splitString = str.split("");
    let reverseArr = splitString.reverse();
    let reversedString = reverseArr.join("");
    return reversedString;
}










function printAlignments(alignemnts) {
    for (let i = 0; i < alignemnts.length; i++) {
        const row = document.createElement('section')



        const sequence1 = document.createElement('h2');
        const sequence2 = document.createElement('h2');

        sequence1.innerText = ` ${alignemnts[i].sequence1} `;
        sequence2.innerText = ` ${alignemnts[i].sequence2} `;


        row.appendChild(sequence1);
        row.appendChild(sequence2);
        row.appendChild(document.createElement('br'));
        algo.appendChild(row);
    }
}





