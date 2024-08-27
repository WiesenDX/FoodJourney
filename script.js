let interactiveElements = [];
let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let currentFocusIndex = 0;

document.addEventListener('DOMContentLoaded', (event) => {
    
    setupArduinoListener();

    var submitButton = document.querySelector('button[type="button"]');
    if (submitButton) {
        submitButton.addEventListener('click', submitSurvey);
    }

    
    printText('\n'); // 打印前的空行
    printText('\n'); // 打印后的空行
    printText('\n'); // 打印后的空行
    

  
    highlightCurrentQuestion();
});

window.onload = function() {
    setupInteractiveElements();
    if (interactiveElements.length > 0) {
        interactiveElements[currentFocusIndex].classList.add('highlight');
    }
};



// 在网页上逐字显示文本内容
function displayTextOnPage(text) {
    const textBox = document.getElementById('textBox');
    if (textBox) {
        textBox.textContent = '';
        for (let char of text) {
            textBox.textContent += char;
        }
    } else {
        console.error('Element with ID "textBox" not found in the DOM.');
    }
}

// 将文本发送到 Arduino
async function sendToArduino(text) {
    try {
        const response = await fetch('/print', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error('Failed to send text to printer');
        }

        console.log('Text sent to printer successfully!'); // Log success
    } catch (error) {
        console.error('Error printing text:', error);
        alert('Error printing text: ' + error.message); // 只在错误时显示提示
    }
}







function setupInteractiveElements() {
    const radioOptions = document.querySelectorAll('input[type="radio"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const buttons = document.querySelectorAll('button, [onclick]');

    interactiveElements = [...radioOptions, ...checkboxes, ...buttons];
}


function setupArduinoListener() {
    const socket = io();

    socket.on('arduinoMessage', (message) => {
        console.log('Received message from Arduino:', message);
        if (message === 'Left') {
            selectPreviousOption();
        } else if (message === 'Right') {
            selectNextOption();
        } else if (message === 'OK') {
            confirmSelection();
        } else if (message === 'Jump') {
            submitSurvey();
        } else if (message === 'Refresh') {
            refreshPage();
        }
    });
}




// 定义在全局作用域
const questions = [
    'question-0',
    'question-1',
    'question-2',
    'question-3',
    'question-4',
    'question-5',
    'question-6',
    'question-7',
];

function focusFirstOptionInCurrentQuestion() {
    // 清除之前的高亮样式
    const previousHighlighted = document.querySelector('.highlight-option');
    if (previousHighlighted) {
        previousHighlighted.classList.remove('highlight-option');
        console.log('Removed previous highlight');
    }

    const questionElement = document.querySelectorAll('.question')[currentQuestionIndex];
    if (questionElement) {
        const firstOption = questionElement.querySelector('input[value="option0"]'); // 选择 option0
        console.log('First option element:', firstOption);

        if (firstOption) {
            firstOption.focus(); // 设置焦点
            firstOption.checked = true; // 设置为选中状态
            
            // 尝试高亮整个 label
            const labelElement = firstOption.closest('label'); // 找到最近的label
            if (labelElement) {
                labelElement.classList.add('highlight-option');
                console.log('Added highlight to label:', labelElement);
            } else {
                // 如果没有 label，直接在 input 上应用高亮
                firstOption.classList.add('highlight-option');
                console.log('Added highlight to input:', firstOption);
            }
        } else {
            console.error('First option not found');
        }
    } else {
        console.error('Question element not found');
    }
}





function selectNextOption() {
    const currentQuestion = questions[currentQuestionIndex];
    const options = document.querySelectorAll(`input[name="${currentQuestion}"]`);

    if (options.length > 0) {
        // 移除当前选项的高亮
        options[currentOptionIndex].parentNode.classList.remove('highlight-option');

        // 计算下一个选项的索引
        currentOptionIndex = (currentOptionIndex + 1) % options.length;

        // 添加高亮到新选项
        options[currentOptionIndex].parentNode.classList.add('highlight-option');
        options[currentOptionIndex].checked = true;

        // 输出当前选中的选项信息
        console.log(`Current Selection: Question ${currentQuestionIndex + 1}, Option ${currentOptionIndex + 1}, Value: ${options[currentOptionIndex].value}`);
    }
}

function selectPreviousOption() {
    const currentQuestion = questions[currentQuestionIndex];
    const options = document.querySelectorAll(`input[name="${currentQuestion}"]`);

    if (options.length > 0) {
        // 移除当前选项的高亮
        options[currentOptionIndex].parentNode.classList.remove('highlight-option');

        // 计算上一个选项的索引
        currentOptionIndex = (currentOptionIndex - 1 + options.length) % options.length;

        // 添加高亮到新选项
        options[currentOptionIndex].parentNode.classList.add('highlight-option');
        options[currentOptionIndex].checked = true;

        // 输出当前选中的选项信息
        console.log(`Current Selection: Question ${currentQuestionIndex + 1}, Option ${currentOptionIndex + 1}, Value: ${options[currentOptionIndex].value}`);
    }
}




// 示例：调用函数时显示选中的值
document.querySelector('button').addEventListener('click', () => {
    getSelectedOption();
});


function confirmSelection(event) {
    if (event) {
        event.preventDefault();  // 防止默认行为，如表单提交
    }
    
    console.log("Confirm Selection called. Current Question Index:", currentQuestionIndex);
    
    const allQuestions = document.querySelectorAll('.question');  // 获取所有问题元素

    if (currentQuestionIndex < 7) {
        currentQuestionIndex++;
        console.log("Switching to Question Index:", currentQuestionIndex);

        highlightCurrentQuestion();  // 高亮显示并滚动到当前问题
       
       
    } else {
        const button = document.querySelector('.center-button');
        if (button) {
            button.scrollIntoView({
                behavior: 'smooth',  // 平滑滚动
                block: 'center'      // 滚动到视口的中间位置
            });
        }
    }
}




function highlightCurrentQuestion() {
    const allQuestions = document.querySelectorAll('.question');

    allQuestions.forEach(question => {
        if (question.classList.contains('highlight')) {
            // 先添加 unhighlight 类，用于背景颜色的渐变消失
            question.classList.add('unhighlight');
            
            // 使用 setTimeout 延时移除 highlight 类，这样会让动画效果生效
            setTimeout(() => {
                question.classList.remove('highlight');
            }, 500); // 500ms与 CSS 中的 transition 时间保持一致
        }
    });

    const currentQuestion = document.querySelector(`.question-${currentQuestionIndex}`);
    if (currentQuestion) {
        // 在添加新高亮前，移除 unhighlight 类
        currentQuestion.classList.remove('unhighlight');
        
        // 添加高亮
        currentQuestion.classList.add('highlight');
        currentQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });  // 滚动到视口的顶部
    } else {
        console.error("No question found for index:", currentQuestionIndex);
    }
}


function removeHighlight() {
    const highlightedElement = document.querySelector('.highlight');
    if (highlightedElement) {
        highlightedElement.classList.remove('highlight');
        highlightedElement.classList.add('unhighlight'); // 添加动画效果
    }
}

function focusFirstOptionInCurrentQuestion() {
    const questionElement = document.querySelectorAll('.question')[currentQuestionIndex];
    if (questionElement) {
        const firstOption = questionElement.querySelector('input[type="radio"]');
        if (firstOption) {
            firstOption.focus();
            firstOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}







function scrollToFirstQuestion() {
    const firstQuestion = document.querySelector('.question');
    if (firstQuestion) {
        firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}



async function printText(text) {
    const textBox = document.getElementById('textBox');
    if (textBox) {
        textBox.textContent = '';

        for (let char of text) {
            textBox.textContent += char;
            await new Promise(resolve => setTimeout(resolve, 50)); // 设置字符显示间隔
        }

        try {
            const response = await fetch('/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                throw new Error('Failed to send text to printer');
            }

            console.log('Text sent to printer successfully!'); // Log success, no alert needed
            // alert('Text sent to printer successfully!'); // 注释掉或删除这行

        } catch (error) {
            console.error('Error printing text:', error);
           
        }
    } else {
        console.error('Element with ID "textBox" not found in the DOM.');
    }
}

function scrollToFirstQuestion() {
    const firstQuestion = document.querySelector('.question');
    if (firstQuestion) {
        firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}


function refreshPage() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';  // 禁用浏览器的滚动恢复
    }
    window.scrollTo(0, 0);  // 先滚动到页面顶部
    window.location.reload();  // 刷新页面
}



async function submitSurvey() {
    const prompt = buildPrompt();
    const openAIApiKey = 'sk-proj-n7YDvF14NNE0uSKTxSjHT3BlbkFJtU4dOy5gXTfLnwR41lc5'; // OpenAI API Key
    const stabilityApiKey = 'sk-dnYomi8XlTLRK1MlKpStHNUJWECq56TRsflNqybIU0DYtBQZ'; // Stable Diffusion API Key
     // 获取目标段落
     const aiSection = document.querySelector('#ai-section');
     // 滚动到目标段落
     aiSection.scrollIntoView({
         behavior: 'smooth',  // 平滑滚动
         block: 'center'      // 滚动到视口的中间位置
     });

        try {
            // 生成描述
            const description = await generateDescription(prompt, openAIApiKey);
            const resultSection = document.getElementById('resultSection');
            if (resultSection) {
                resultSection.innerHTML = ''; // 清空之前的内容

                const paragraphs = description.split('\n').filter(paragraph => paragraph.trim() !== '');
                paragraphs.forEach((paragraph, index) => {
                    const p = document.createElement('p');
                    p.textContent = paragraph;
    
                    // 设置前两个段落的字体大小为24px，其余的为18px
                    if (index === 0 || index === 2) {
                        p.style.fontSize = '24px';
                    } else {
                        p.style.fontSize = '18px';
                    }
                    p.style.lineHeight = '1.6';
    
                    resultSection.appendChild(p);

                    // 将文字滚动到视图顶部
                    resultSection.scrollIntoView({
                        behavior: 'smooth', // 平滑滚动
                        block: 'start' // 滚动到元素的顶部
                })})
            } else {
                console.error('Element with ID "resultSection" not found in the DOM.');
            }
    
            // 将生成的描述发送到 Arduino
        sendToArduino(description);
    
            // 显示“等待AI生成...”的提示
            const imagePlaceholder = document.getElementById('imagePlaceholder');
            if (imagePlaceholder) {
                imagePlaceholder.innerText = '等待AI生成...';
            } else {
                console.error('Element with ID "imagePlaceholder" not found in the DOM.');
            }
    
            // 使用生成的描述生成图片
            const imageUrl = await generateImage(description, stabilityApiKey);
            
            if (imagePlaceholder) {
           
    
                // 创建和插入图片
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Generated Image';
            imageElement.width = 512; // 设置图片宽度
            imageElement.height = 512; // 设置图片高度

            imagePlaceholder.innerHTML = '';
            imagePlaceholder.appendChild(imageElement);

             // 将图片滚动到视图顶部
             imageElement.scrollIntoView({
                behavior: 'smooth', // 平滑滚动
                block: 'start' // 滚动到元素的顶部
            });
            }
    
        } catch (error) {
            console.error('Error during image and description generation:', error);
            alert('Error during image and description generation: ' + error.message);
        }
    }
    

function buildPrompt() {
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    let prompt = '';

    for (let entry of formData.entries()) {
        const suffix = entry[0] === 'ingredient' ? ', ' : ' ';
        prompt += entry[1] + suffix;
    }

    prompt += "Generate a local dish from a real city based on the city's description, using the provided ingredients as the main components. You can also use your imagination to add other ingredients.";

    return prompt.trim();
}

async function generateImage(prompt, apiKey) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'webp');

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'image/*'
        },
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate image: ${errorText}`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
}

async function generateDescription(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `1:City Name: A real city's name,2:Experience Description: A description of the experience of the city,3:The name of dish, 4:Describe a dish that embodies the essence of ${prompt}, 5:focusing on the taste profile without mentioning the style explicitly,and then write a personal memory of a local person about this dish..`
            }],
            max_tokens: 300
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to generate description: ${data.error ? data.error.message : 'Unknown error'}`);
    }

    return data.choices[0].message.content;
}
