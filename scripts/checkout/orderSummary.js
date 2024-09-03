import {cart, removeFromCart, calculateCartQuantity, saveToStorage, updateCartQuantity, updateDeliveryOption} from '../../data/cart.js';
import {products, getProduct} from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';

export function renderOrderSummary(){

let cartSummaryHTML = '';

cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
    const deliveryDate = today.add(
        deliveryOption.deliveryDays,
        'days'
    );
    const dateString = deliveryDate.format(
        'dddd, MMMM D'
    );

    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
            Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
            <img class="product-image" src="${matchingProduct.image}">

            <div class="cart-item-details">
                <div class="product-name">
                    ${matchingProduct.name}
                </div>
                <div class="product-price">
                    ${matchingProduct.getPrice()}
                </div>
            </div>
            <div class="product-quantity">
                <span>
                    Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                </span>
                <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                    Update
                </span>
                <input class="quantity-input" type="number" value="${cartItem.quantity}">
                <span class="save-quantity-link link-primary js-save-link" data-product-id="${matchingProduct.id}">Save</span>
                <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                    Delete
                </span>
            </div>
        </div>

        <div class="delivery-options">
            <div class="delivery-options-title">
                Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
            </div>
        </div>
    </div>
`;
});

function deliveryOptionsHTML(matchingProduct, cartItem){

    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
        const today = dayjs();
        const deliveryDate = today.add(
            deliveryOption.deliveryDays,
            'days'
        );
        const dateString = deliveryDate.format(
            'dddd, MMMM D');

        const priceString = deliveryOption.priceCents
        === 0
        ? 'FREE'
        : `$${formatCurrency(deliveryOption.
            priceCents)} - `;

        const isChecked = deliveryOption.id === 
        cartItem.deliveryOptionId;

       html += `
         <div class="delivery-option js-delivery-option"
         data-product-id="${matchingProduct.id}"
         data-delivery-option-id="${deliveryOption.id}">
            <input type="radio" 
            ${isChecked ? 'checked': ''}
            class="delivery-option-input" 
            name="delivery-option-${matchingProduct.
                id}">
             <div>
                <div class="delivery-option-date">
                ${dateString}
                </div>
                 <div class="delivery-option-price">
                ${priceString} - Shipping
                </div>
            </div>
         </div>
        `
    });

    return html;
}

document.querySelector('.js-order-summary')
    .innerHTML = cartSummaryHTML ;

document.addEventListener('DOMContentLoaded', () => {
    const cartQuantity = calculateCartQuantity();
    const cartCountElement = document.querySelector('.js-cart-count');
    if (cartCountElement) {
        cartCountElement.innerHTML = `${cartQuantity} items`;
    }
});

document.querySelectorAll('.js-delete-link')
    .forEach((link) =>{
    link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        removeFromCart(productId);

        const container = document.querySelector(
            `.js-cart-item-container-${productId}`
        );
            container.remove();
            const cartQuantity = calculateCartQuantity();
            const cartCountElement = document.querySelector('.js-cart-count');
            
            if (cartCountElement) {
                cartCountElement.innerHTML = `${cartQuantity} items`;
            }
            
            renderOrderSummary();
            renderPaymentSummary(); 
    });
 });

 document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(`.js-cart-item-container-${productId}`);

        if (container) {
            container.classList.add('is-editing-quantity');

            const input = container.querySelector('.quantity-input');
            if (input) {
                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        saveQuantity(container, productId);
                    }
                });
            }
        }
    });
});

document.querySelectorAll('.js-save-link').forEach((link) => {
    link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        if (container) {
            saveQuantity(container, productId);
        }
    });
});

function saveQuantity(container, productId) {
    const newQuantity = parseInt(container.querySelector('.quantity-input').value, 10);

    if (newQuantity >= 0 && newQuantity < 1000) {
        updateCartQuantity(productId, newQuantity);

        container.querySelector('.quantity-label').innerText = newQuantity;

        const cartQuantity = calculateCartQuantity();
        const cartCountElement = document.querySelector('.js-cart-count');
        if (cartCountElement) {
            cartCountElement.innerHTML = `${cartQuantity} items`;
        }

        container.classList.remove('is-editing-quantity');
    } else {
        alert("Please enter a quantity between 0 and 999.");
    }
}


document.querySelectorAll('.js-delivery-option')
    .forEach((element) => {
        element.addEventListener('click', () => {
            const productId = element.dataset.productId;
            const deliveryOptionId = element.dataset.deliveryOptionId;
            updateDeliveryOption(productId, deliveryOptionId);
            renderOrderSummary();
            renderPaymentSummary();
        });
    });
};
