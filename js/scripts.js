// scripts.js - общие функции для всех страниц с улучшенной доступностью

// Плавная прокрутка для навигационных ссылок
document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка для якорных ссылок
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Обновляем фокус для скринридеров
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });

    // Улучшенная валидация форм
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Валидация в реальном времени
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.hasAttribute('aria-invalid')) {
                    validateField(this);
                }
            });
        });

        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                // Фокус на первое поле с ошибкой
                const firstInvalid = this.querySelector('[aria-invalid="true"]');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                
                // Сообщение для скринридера
                const errorMessage = document.createElement('div');
                errorMessage.setAttribute('role', 'alert');
                errorMessage.setAttribute('aria-live', 'assertive');
                errorMessage.className = 'form-error-message sr-only';
                errorMessage.textContent = 'Пожалуйста, исправьте ошибки в форме перед отправкой.';
                
                this.appendChild(errorMessage);
                setTimeout(() => {
                    this.removeChild(errorMessage);
                }, 5000);
            }
        });
    });

    // Функция валидации поля
    function validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        let isValid = true;
        
        if (isRequired && !value) {
            field.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.setAttribute('aria-invalid', 'true');
                isValid = false;
            } else {
                field.setAttribute('aria-invalid', 'false');
            }
        } else {
            field.setAttribute('aria-invalid', 'false');
        }
        
        return isValid;
    }

    // Ленивая загрузка изображений с Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                    }
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Динамическое обновление года в футере
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.footer__copyright');
    yearElements.forEach(element => {
        if (element.textContent.includes('2025')) {
            element.textContent = element.textContent.replace('2025', currentYear);
        }
    });

    // Анимация прогресс-баров при загрузке страницы
    const progressBars = document.querySelectorAll('.skill__progress-bar, .course__progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });

    // Улучшенная навигация с клавиатурой
    document.addEventListener('keydown', function(e) {
        // Обработка Escape для закрытия модальных окон
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Обработка Enter/Space для элементов с ролью button
        if ((e.key === 'Enter' || e.key === ' ') && 
            (e.target.getAttribute('role') === 'button' || 
             e.target.classList.contains('project-card'))) {
            e.preventDefault();
            e.target.click();
        }
    });

    // Инициализация доступных модальных окон
    initAccessibleModals();
});

// Функции для модальных окон с улучшенной доступностью
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Сохраняем текущий активный элемент
        modal._previousActiveElement = document.activeElement;
        
        // Показываем модальное окно
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Скрываем остальной контент от скринридеров
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('aria-hidden', 'true');
        }
        
        // Фокус на модальное окно
        modal.setAttribute('tabindex', '-1');
        modal.focus();
        
        // Добавляем обработчик для ловушки фокуса
        trapFocus(modal);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Возвращаем видимость основному контенту
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.removeAttribute('aria-hidden');
        }
        
        // Возвращаем фокус на предыдущий элемент
        if (modal._previousActiveElement) {
            modal._previousActiveElement.focus();
        }
        
        // Убираем ловушку фокуса
        removeFocusTrap(modal);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.style.display === 'block') {
            const modalId = modal.id;
            closeModal(modalId);
        }
    });
}

// Ловушка фокуса внутри модального окна
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal._keydownHandler = function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };

    modal.addEventListener('keydown', modal._keydownHandler);
}

function removeFocusTrap(modal) {
    if (modal._keydownHandler) {
        modal.removeEventListener('keydown', modal._keydownHandler);
        delete modal._keydownHandler;
    }
}

// Инициализация доступных модальных окон
function initAccessibleModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Добавляем ARIA атрибуты
        if (!modal.hasAttribute('role')) {
            modal.setAttribute('role', 'dialog');
        }
        if (!modal.hasAttribute('aria-modal')) {
            modal.setAttribute('aria-modal', 'true');
        }
        
        // Добавляем описание если есть заголовок
        const title = modal.querySelector('h2, h3, h4');
        if (title && !title.id) {
            title.id = 'modal-title-' + Math.random().toString(36).substr(2, 9);
        }
        if (title && !modal.hasAttribute('aria-labelledby')) {
            modal.setAttribute('aria-labelledby', title.id);
        }
    });
}

// Закрытие модальных окон при клике вне контента
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Утилиты для доступности
function announceToScreenReader(message, priority = 'polite') {
    const announcer = document.getElementById('screen-reader-announcer') || createScreenReaderAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
}

function createScreenReaderAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
    return announcer;
}

// Улучшенная обработка динамического контента
function updateLiveRegion(message, regionId = 'dynamic-content') {
    let region = document.getElementById(regionId);
    if (!region) {
        region = document.createElement('div');
        region.id = regionId;
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);
    }
    region.textContent = message;
}