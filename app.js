// 👉 这里后续部署的时候要改成你的后端公网地址，本地测试用localhost就可以
const baseUrl = "https://photographers-sydney-tap-meetings.trycloudflare.com";

// 页面元素
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');

// 页面加载时自动加载历史记录
window.onload = function() {
    loadHistory();
};

// 向输入框添加内容
function appendToDisplay(value) {
    if (display.textContent === '0' && value !== '.') {
        display.textContent = value;
    } else {
        display.textContent += value;
    }
}

// 清空输入框
function clearDisplay() {
    display.textContent = '0';
}

// 发送请求给后端计算
async function calculate() {
    const expression = display.textContent;
    // 把界面的×÷转成后端能识别的*/
    const processedExpression = expression.replace('×', '*').replace('÷', '/');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expression: processedExpression
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || '计算失败');
        }
        
        // 更新输入框为结果
        display.textContent = data.result;
        // 重新加载历史记录
        loadHistory();
    } catch (error) {
        alert(error.message);
    }
}

// 加载历史记录
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('获取历史失败');
        }
        
        // 清空列表
        historyList.innerHTML = '';
        
        if (data.history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #868e96;">暂无计算历史</p>';
            return;
        }
        
        // 渲染历史列表
        data.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const content = document.createElement('div');
            content.innerHTML = `
                <div class="history-expression">${item.expression.replace('*', '×').replace('/', '÷')} =</div>
                <div class="history-result">${item.result}</div>
                <div class="history-time">${item.created_at}</div>
            `;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.onclick = () => deleteHistory(item.id);
            
            historyItem.appendChild(content);
            historyItem.appendChild(deleteBtn);
            historyList.appendChild(historyItem);
        });
    } catch (error) {
        alert(error.message);
    }
}

// 删除历史记录
async function deleteHistory(id) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || '删除失败');
        }
        
        // 重新加载历史
        loadHistory();
    } catch (error) {
        alert(error.message);
    }
}
