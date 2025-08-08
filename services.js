const getAuthData = () => {
    const token = localStorage.getItem('token');
    const dealer = JSON.parse(localStorage.getItem('dealer'));
    const userId = dealer ? dealer.id : null;
    return { token, userId };
};

const fetchGet = async (url, token) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'login_page.html';
                return null;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch GET error:', error);
        if (error.message.includes('401')) return null;
        alert('An error occurred while fetching data. Please try again.');
        return null;
    }
};

const fetchPost = async (url, token, body) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'login_page.html';
                return null;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch POST error:', error);
        if (error.message.includes('401')) return null; // Avoid duplicate alert
        alert('An error occurred while submitting data. Please try again.');
        return null;
    }
};

/* =============== Login Page =============== */

const login = async (username, password) => {
    const response = await fetchPost('http://185.105.91.97:8080/api/login', null, {
        username,
        password,
    });
    if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('dealer', JSON.stringify(response.user));
        window.location.href = 'home_page.html';
    }
};

/* =============== Login End =============== */


/* =============== Folder API Services =============== */

function nextDetailPage(id) {
    localStorage.setItem('folderId', id);
    window.location.href = 'folder_detail_page.html';
}

const loadFolders = async () => {
    const { token, userId } = getAuthData();
    if (!token || !userId) {
        alert('Please log in.');
        window.location.href = 'login_page.html';
        return;
    }

    const { result } = await fetchGet(`http://185.105.91.97:8080/api/folder/list/${userId}`, token);
    if (result) {
        const folderList = document.querySelector('#folderPage');
        const folderCount = document.querySelector('#folderCount');
        folderCount.textContent = result.length;
        folderList.innerHTML = '';
        result.forEach(folder => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200';
            folderDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-folder text-2xl text-yellow-500"></i>
                        <div>
                            <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 cursor-pointer" onclick="nextDetailPage(${folder.id})">${folder.title}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${folder.created_at || 'N/A'}</div>
                        </div>
                    </div>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteFolder(${folder.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            document.getElementById('folderPage').appendChild(folderDiv);
        });
    }
};

const deleteFolder = async (folderId) => {
    const { token } = getAuthData();
    const response = await fetchGet(`http://185.105.91.97:8080/api/folder/delete/${folderId}`, token);
    if (response) {
        loadFolders();
    }
};

const createFolder = async (event) => {
    event.preventDefault();
    const { token, userId } = getAuthData();
    const title = document.querySelector('#title').value;
    const description = document.querySelector('#description').value;

    const response = await fetchPost('http://185.105.91.97:8080/api/folder/create', token, {
        user_id: userId,
        title,
        description,
    });
    if (response) {
        window.location.href = 'folder_page.html';
    }
};

const loadFolderDetails = async () => {
    const { token } = getAuthData();
    const folderId = localStorage.getItem('folderId');
    if (!folderId) {
        alert('No folder selected.');
        window.location.href = 'folder_page.html';
        return;
    }

    try {
        const productsResponse = await fetchGet(`http://185.105.91.97:8080/api/product/list/${folderId}`, token)
        const products = productsResponse?.result || [];
        const totalCount = document.querySelector('#soldTotalCount');
        totalCount.textContent = products.length;

        const statsContainer = document.getElementById('statsContainer');
        statsContainer.innerHTML = '';

        Object.entries(productsResponse.data).forEach(([key, value]) => {
            const statDiv = document.createElement('div');
            statDiv.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow';
            statDiv.innerHTML = `
                <div class="font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    ${key}
                </div>
                <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    <span>${value}</span>
                </div>
            `;
            statsContainer.appendChild(statDiv);
        });

        const productList = document.getElementById('productList');
        productList.innerHTML = '';
        products?.forEach((pro) => {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'col-span-1 md:col-span-2 lg:col-span-1';
            typeDiv.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between">
                        <div class="text-lg font-semibold text-gray-800 dark:text-gray-200">${pro.title}</div>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteProduct(${pro.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <div class="text-sm text-gray-500 dark:text-gray-400">ID: ${pro.qr_id}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Gramm: ${pro.gramm}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Proba: ${pro.proba}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Size: ${pro.size}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Price: ${pro.price}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Type: ${pro.type}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Status: ${pro.status}</div>
                    </div>      
                </div>
            `;
            productList.appendChild(typeDiv);

        });

        const productForm = document.querySelector('form');
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productId = document.querySelector('#productId').value;
            const product = await fetchGet(`http://185.105.91.97:8080/api/product/get/${productId}`, token);
            if (product) {
                await fetchPost(`http://185.105.91.97:8080/api/product/create/${productId}`, token, { folder_id: folderId });
                loadFolderDetails();
            } else {
                alert('Product not found.');
            }
        });
    } catch (error) {
        console.error('Error loading folder details:', error);
    }
};

const loadFolderDetailsSold = async () => {
    const { token } = getAuthData();
    const folderId = localStorage.getItem('folderId');
    if (!folderId) {
        alert('No folder selected.');
        window.location.href = 'folder_page.html';
        return;
    }

    try {
        const soldProductsRes = await fetchGet(`http://185.105.91.97:8080/api/product/list/sold/${folderId}`, token)
        const soldProducts = soldProductsRes?.result || [];
        const totalCount = document.querySelector('#soldTotalCount');
        totalCount.textContent = soldProducts.length;

        const statsContainer = document.getElementById('statsContainer');
        statsContainer.innerHTML = '';

        Object.entries(soldProductsRes.data).forEach(([key, value]) => {
            const statDiv = document.createElement('div');
            statDiv.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow';
            statDiv.innerHTML = `
                <div class="font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    ${key}
                </div>
                <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    <span>${value}</span>
                </div>
                `;
            statsContainer.appendChild(statDiv);
        });

        const productList = document.getElementById('productList');
        productList.innerHTML = '';
        soldProducts?.forEach((pro) => {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'col-span-1 md:col-span-2 lg:col-span-1';
            typeDiv.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between">
                        <div class="text-lg font-semibold text-gray-800 dark:text-gray-200">${pro.title}</div>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteProduct(${pro.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <div class="text-sm text-gray-500 dark:text-gray-400">ID: ${pro.qr_id}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Gramm: ${pro.gramm}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Proba: ${pro.proba}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Size: ${pro.size}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Price: ${pro.price}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Type: ${pro.type}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Status: ${pro.status}</div>
                    </div>      
                </div>
            `;
            productList.appendChild(typeDiv);

        });

        const productForm = document.querySelector('form');
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productId = document.querySelector('input[placeholder="Enter Product ID"]').value;
            const product = await fetchGet(`http://185.105.91.97:8080/api/product/get/${productId}`, token);
            if (product) {
                await fetchPost(`http://185.105.91.97:8080/api/product/create/${productId}`, token, { folder_id: folderId });
                loadFolderDetails();
            } else {
                alert('Product not found.');
            }
        });
    } catch (error) {
        console.error('Error loading folder details:', error);
    }
};

/* =============== Folder API Services End =============== */

const deleteProduct = async (productId) => {
    const { token } = getAuthData();
    const response = await fetchGet(`http://185.105.91.97:8080/api/product/delete/${productId}`, token);
    if (response) {
        loadFolderDetails();
    }
};

const changeProductStatus = async (productId, folderId) => {
    const { token } = getAuthData();
    const response = await fetchGet(`http://185.105.91.97:8080/api/product/change-status/${productId}/${folderId}`, token);
    if (response) {
        loadFolderDetails();
    }
};

function nextClientDetailPage(id) {
    localStorage.setItem('clientId', id);
    window.location.href = 'client_debt_page.html';
}

const loadClients = async () => {
    const { token, userId } = getAuthData();
    const { result } = await fetchGet(`http://185.105.91.97:8080/api/client/list/${userId}`, token);
    const totalDebt = await fetchGet(`http://185.105.91.97:8080/api/client/total_debt/${userId}`, token);
    if (result && totalDebt.result) {
        const clientList = document.querySelector('#clientPage');
        const clientCount = document.querySelector('#clientCount');
        const totalDebtSpan = document.querySelector('#totalClientDebt');
        clientCount.textContent = result.length;
        totalDebtSpan.textContent = totalDebt.result || 0;

        clientList.innerHTML = '';
        result.forEach(client => {
            const clientDiv = document.createElement('div');
            clientDiv.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4';
            clientDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-user text-2xl text-indigo-500"></i>
                        <div>
                            <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 cursor-pointer" onclick="nextClientDetailPage(${client.id})">${client.full_name}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${client.phone_number}</div>
                        </div>
                    </div>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteClient(${client.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                `;
            clientPage.appendChild(clientDiv);
        });
    }
};

const deleteClient = async (clientId) => {
    const { token } = getAuthData();
    const response = await fetchGet(`http://185.105.91.97:8080/api/client/delete/${clientId}`, token);
    if (response) {
        loadClients();
    }
};

const createClient = async (event) => {
    event.preventDefault();
    const { token, userId } = getAuthData();
    const fullName = document.querySelector('#fullName').value;
    const phoneNumber = document.querySelector('#phoneNumber').value;

    const response = await fetchPost('http://185.105.91.97:8080/api/client/create', token, {
        full_name: fullName,
        phone_number: phoneNumber,
        user_id: userId,
    });
    if (response) {
        window.location.href = 'client_page.html';
    }
};

const loadClientDebts = async () => {
    const { token } = getAuthData();
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
        window.location.href = 'client_page.html';
        return;
    }

    const debts = await fetchGet(`http://185.105.91.97:8080/api/client_debt/list/${clientId}`, token);
    const client = await fetchGet(`http://185.105.91.97:8080/api/client/total_debt/${clientId}`, token);
    if (debts.result) {
        const fullName = document.querySelector('#fullName');
        const phoneNumber = document.querySelector('#phoneNumber');
        const totalDebt = document.querySelector('#totalDebt');
        fullName.textContent = client?.result.full_name;
        phoneNumber.textContent = client?.result.phone_number;
        totalDebt.textContent = debts?.result?.reduce((sum, debt) => sum + debt.lom, 0);

        const debtList = document.querySelector('#clientDebtPage');
        debtList.innerHTML = '';
        debts?.result?.forEach(debt => {
            const debtDiv = document.createElement('div');
            debtDiv.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4';
            debtDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-money-check-alt text-2xl text-green-500"></i>
                        <div>
                            <div class="text-lg font-semibold text-gray-800 dark:text-gray-200">${debt.lom}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${new Date().toISOString().split('T')[0]}</div>
                        </div>
                    </div>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteClientDebt(${debt.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                `;
            debtList.appendChild(debtDiv);
        });
    }
};

const deleteClientDebt = async (clientDebtId) => {
    const { token } = getAuthData();
    const response = await fetchGet(`http://185.105.91.97:8080/api/client_debt/delete/${clientDebtId}`, token);
    if (response) {
        loadClientDebts();
    }
};

const createClientDebt = async (event) => {
    event.preventDefault();
    const { token } = getAuthData();
    const clientId = localStorage.getItem('clientId');
    const lom = document.querySelector('#money').value;
    const comment = document.querySelector('#comment').value;

    const response = await fetchPost('http://185.105.91.97:8080/api/client_debt/create', token, {
        client_id: clientId,
        lom,
        comment,
    });
    if (response) {
        window.location.href = 'client_debt_page.html';
    }
};

let salaryStats = {};

const initializeSalaryStats = (salaryTypes) => {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '';
    salaryStats = salaryTypes.reduce((acc, { type }) => {
        acc[type] = { count: 0 };
        const statDiv = document.createElement('div');
        statDiv.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow';
        statDiv.innerHTML = `
            <div class="font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <i class="fas fa-chart-line mr-2"></i> ${type} Count
            </div>
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                <span id="stat_${type}_count">0</span>
            </div>
        `;
        statsContainer.appendChild(statDiv);
        return acc;
    }, {});
};

const updateSalaryStats = (productType) => {
    if (salaryStats[productType]) {
        salaryStats[productType].count += 1;
        document.getElementById(`stat_${productType}_count`).textContent = salaryStats[productType].count;
    }
};

const loadCalculator = async (event) => {
    event.preventDefault();
    const { token } = getAuthData();

    if (!token) {
        alert('Authentication token is missing. Please log in again.');
        window.location.href = 'login_page.html';
        return;
    }

    const productId = document.querySelector('#productId')?.value?.trim();
    if (!productId) {
        alert('Please enter a valid product ID.');
        return;
    }

    try {
        if (Object.keys(salaryStats).length === 0) {
            const salaryResponse = await fetchGet('http://45.95.202.5:8080/api/salary/list', token);
            if (salaryResponse?.result) {
                initializeSalaryStats(salaryResponse.result);
            } else {
                throw new Error('Failed to load salary types.');
            }
        }

        const productResponse = await fetchGet(`http://185.105.91.97:8080/api/product/get/${productId}`, token);
        if (!productResponse || typeof productResponse !== 'object') {
            throw new Error('Invalid product response format.');
        }

        const product = productResponse.result || {};
        if (Object.keys(product).length === 0) {
            throw new Error('No product found for the given ID.');
        }

        const totalCount = document.querySelector('#productTotalCount');
        totalCount.textContent = 1; 

        const productList = document.getElementById('calculatorList');
        productList.innerHTML += `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
                <div class="text-lg font-semibold text-gray-800 dark:text-gray-200">${product.title || 'N/A'}</div>
                <button class="text-red-500 hover:text-red-700" onclick="deleteProduct(${product.id || 0})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <div class="text-sm text-gray-500 dark:text-gray-400">ID: ${product.qr_id || 'N/A'}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Gramm: ${product.gramm?.toFixed(2) || '0.00'}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Proba: ${product.proba || 'N/A'}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Size: ${product.size || 'N/A'}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Price: ${product.price?.toFixed(2) || '0.00'}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Type: ${product.type || 'N/A'}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Status: ${product.status || 'N/A'}</div>
            </div>
        </div>`;
        updateSalaryStats(product.type); 
    } catch (error) {
        console.error('Error loading calculator data:', error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop();
    switch (path) {
        case 'folder_page.html':
            loadFolders();
            break;
        case 'folder_detail_page.html':
            loadFolderDetails();
            break;
        case 'folder_detail_sold_page.html':
            loadFolderDetailsSold();
            break;
        case 'folder_create_page.html':
            document.querySelector('form').addEventListener('submit', createFolder);
            break;
        case 'client_page.html':
            loadClients();
            break;
        case 'client_debt_page.html':
            loadClientDebts();
            break;
        case 'client_create_page.html':
            document.querySelector('form').addEventListener('submit', createClient);
            break;
        case 'client_debt_create_page.html':
            document.querySelector('form').addEventListener('submit', createClientDebt);
            break;
        case 'calculator_page.html':
            document.querySelector('#calculatorForm').addEventListener('submit', loadCalculator);
            break;
    }
});