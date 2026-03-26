# Pytania do uzupelnienia

## Getprice.pl
1. **Konfigurator serwerów** — potrzebuję przejść przez konfigurator krok po kroku. Jaka jest ścieżka? (np. wybór generacji → rack/tower → RAM → dysk → koszyk)? Czy mógłbyś podać link do konfiguratora i opisać kroki?
https://getprice.pl/pl/fujitsu-rx300-s8-konfigurator-fujitsu-primergy-rx300-s8-8x-25.html
klikasz przejdz do konfiguracji i masz tam pytania rozwijasz o odpowiadasz 

np pierwszy to obudowa
<button name="0-option" class="flex items-center justify-between w-full gap-4" :class="{ 'active': active }" tabindex="0" @click="active = !active" @keydown.window.escape="active = false" aria-label="Wybierz Obudowa" aria-controls="details-0-option" :aria-expanded="active ? true : false" aria-expanded="false">
                                    <div class="grid items-start w-full grid-cols-auto-auto-1">
                                        <div class="flex justify-center items-center flex-shrink-0 border text-sm leading leading-body-m rounded h-8 w-8">
                                            1                                        </div>
                                        <label id="option-label-128399" class="label text-lg lg:text-xl leading-8 lg:leading-8 font-semibold ml-6
                                                    font-microsquare cursor-pointer text-ellipsis whitespace-nowrap overflow-hidden
                                                    required">
                                            Obudowa                                        </label>
                                                                                    <div class="status ml-4 h-8 flex items-center self-center justify-self-end" x-show="(() =&gt; {
                                                    const option = selectedOptions?.[128399];
                                                    return !!(
                                                        option &amp;&amp;
                                                        option.selections &amp;&amp;
                                                        Object.keys(option.selections).length &gt; 0
                                                    );
                                                })()">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img">
<rect width="24" height="24" rx="12" fill="#1EA66E"></rect>
<path d="M7.5 12.5L11 16L17.5 9.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<title>accept</title></svg>
                                            </div>
                                                                            </div>
                                    <div class="h-6 w-6 bg-no-repeat bg-center bg-contain" style="background-image: url('https://getprice.pl/static/version1774361136/frontend/Theme/getprice/pl_PL/svg/plus-tab.svg')" :style="`background-image: url('${active ? 'https://getprice.pl/static/version1774361136/frontend/Theme/getprice/pl_PL/svg/minus-tab.svg' : 'https://getprice.pl/static/version1774361136/frontend/Theme/getprice/pl_PL/svg/plus-tab.svg'}')`">
                                    </div>
                                </button>


                                
po kliknieciu on sie rozwija i wtedy wybierasz pokolei opcje i lecisz dalej

2. **Czy konto l.tumiel@auroracreation.com istnieje na getprice?** (logowanie działa, więc chyba tak)

tak istnieje
3. **Newsletter** — gdzie jest formularz newslettera? (stopka? osobna strona?) W willsorze:
na stronie głównej nad stopka:
<div class="content">
        <label for="footer_newsletter">Wprowadź swój adres e-mail</label>
        <form class="form subscribe" novalidate="novalidate" action="https://www.willsoor.pl/newsletter/subscriber/new/" method="post" id="newsletter-validate-detail">
            <div class="field newsletter">
                <label class="label" for="footer_newsletter"><span>Subskrybuj nasz newsletter:</span></label>
                <div class="control">
                    <input name="email" type="email" id="footer_newsletter" data-validate="{required:true, 'validate-email':true}" placeholder="Podaj swój adres email">
                <div data-lastpass-icon-root="" style="position: relative !important; height: 0px !important; width: 0px !important; display: initial !important; float: left !important;"><template shadowrootmode="closed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lastpass-icon="true" data-testid="infield-icon" style="position: absolute; cursor: pointer; height: 22px; max-height: 22px; width: 22px; max-width: 22px; top: 6.6px; left: 222px; z-index: auto; color: rgb(186, 192, 202);"><rect x="0.680176" y="0.763062" width="22.6392" height="22.4737" rx="4" fill="currentColor"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M19.7935 7.9516C19.7935 7.64414 20.0427 7.3949 20.3502 7.3949C20.6576 7.3949 20.9069 7.64414 20.9069 7.9516V16.0487C20.9069 16.3562 20.6576 16.6054 20.3502 16.6054C20.0427 16.6054 19.7935 16.3562 19.7935 16.0487V7.9516Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M4.76288 13.6577C5.68525 13.6577 6.43298 12.9154 6.43298 11.9998C6.43298 11.0842 5.68525 10.3419 4.76288 10.3419C3.8405 10.3419 3.09277 11.0842 3.09277 11.9998C3.09277 12.9154 3.8405 13.6577 4.76288 13.6577Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3298 13.6577C11.2521 13.6577 11.9999 12.9154 11.9999 11.9998C11.9999 11.0842 11.2521 10.3419 10.3298 10.3419C9.4074 10.3419 8.65967 11.0842 8.65967 11.9998C8.65967 12.9154 9.4074 13.6577 10.3298 13.6577Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M15.8964 13.6577C16.8188 13.6577 17.5665 12.9154 17.5665 11.9998C17.5665 11.0842 16.8188 10.3419 15.8964 10.3419C14.974 10.3419 14.2263 11.0842 14.2263 11.9998C14.2263 12.9154 14.974 13.6577 15.8964 13.6577Z" fill="white"></path></svg></template></div></div>
            </div>
            <div class="actions">
                <button class="action subscribe primary" title="Subskrybuj" type="submit">
                    <span>Zapisz się</span>
                </button>
            </div>
        <div class="field-recaptcha" id="recaptcha-caa20ac351216e6f76edced1efe7c61fff5f4796-container" data-bind="scope:'recaptcha-caa20ac351216e6f76edced1efe7c61fff5f4796'">
    <!-- ko template: getTemplate() -->

<div data-bind="{
    attr: {
        'id': getReCaptchaId() + '-wrapper'
    },
    'afterRender': renderReCaptcha()
}" id="recaptcha-caa20ac351216e6f76edced1efe7c61fff5f4796-wrapper">
    <div class="g-recaptcha" id="recaptcha-caa20ac351216e6f76edced1efe7c61fff5f4796"><div class="grecaptcha-badge" data-style="none" style="width: 256px; height: 60px; position: fixed; visibility: hidden;"><div class="grecaptcha-logo"><iframe title="reCAPTCHA" width="256" height="60" role="presentation" name="a-3nwc5lrjrpjt" frameborder="0" scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6Lf3kwIrAAAAAL-O_G6o4epr4Hudttimu985wm7h&amp;co=aHR0cHM6Ly93d3cud2lsbHNvb3IucGw6NDQz&amp;hl=pl&amp;v=qm3PSRIx10pekcnS9DjGnjPW&amp;theme=light&amp;size=invisible&amp;badge=bottomleft&amp;anchor-ms=20000&amp;execute-ms=30000&amp;cb=p3iwfy1184kn"></iframe></div><div class="grecaptcha-error"></div><textarea id="g-recaptcha-response-1" name="g-recaptcha-response" class="g-recaptcha-response" style="width: 250px; height: 40px; border: 1px solid rgb(193, 193, 193); margin: 10px 25px; padding: 0px; resize: none; display: none;"></textarea></div></div>
    <!-- ko if: (!getIsInvisibleRecaptcha()) --><!-- /ko -->
</div>
<!-- /ko -->
</div><input type="text" name="token" style="display: none"></form>
        <div class="recaptcha-text-wrapper">
            <div class="recaptcha-text">
                Ta strona jest chroniona przez reCAPTCHA oraz Google, obowiązuje <a href="https://policies.google.com/privacy" target="_blank">polityka prywatności</a> oraz <a href="https://policies.google.com/terms" target="_blank">warunki korzystania z usługi</a>.            </div>
        </div>
        <div class="newsletter-agreement mt-3">
            <div data-content-type="html" data-appearance="default" data-element="main" data-decoded="true">Zapisując się do newslettera akceptuję i rozumiem <a href="https://www.willsoor.pl/polityka-cookies">Politykę prywatności oraz Cookies</a> i wyrażam zgodę na otrzymywanie spersonalizowanych informacji handlowych drogą mailową. 

<!-- Podanie adresu e-mail jest dobrowolne, ale niezbędne do korzystania z Newslettera. Przysługuje mi prawo dostępu do treści moich danych osobowych oraz ich poprawiania. Administratorem danych osobowych jest DT CONSULTING Dominik Tomaszewski z siedzibą w Lesznie (64–100), przy ul. Gronowskiej 6a. Dane osobowe zawarte w powyższym formularzu będą przetwarzane w celu realizacji usługi Newsletter oraz w celach marketingowych. --></div>        </div>
    </div>
## Willsoor.pl
1. **Czy konto l.tumiel@auroracreation.com istnieje na willsoor?** (reCAPTCHA blokuje logowanie w Playwright, nie mogę zweryfikować)

tak
2. **Newsletter** — widzę formularz w stopce. Czy jest na osobnej stronie też?

skup sie na tym na stronie glownej

3. **Czy da się wyłączyć reCAPTCHA na willsoor dla testów?** (blokuje logowanie i rejestrację)

nie, skipuj i daj adnotacje najwyzej
## 4szpaki.pl
1. **Czy konto l.tumiel@auroracreation.com istnieje na 4szpaki?** (do sprawdzenia)

tak
2. **Produkty** — strona produktu ma warianty z wieloma przyciskami "Dodaj". Czy to normalne? Czy jest jakiś prosty produkt bez wariantów?

produkt simple: https://4szpaki.pl/mydla-w-kostce/p/mydlo-mis


3. **Newsletter** — gdzie jest?

## Pieceofcase.pl
1. **Czy konto l.tumiel@auroracreation.com istnieje na pieceofcase?**
2. **Produkt** — etui wymaga wyboru modelu telefonu. Jak działa flow: wybierasz markę → model → kolor → koszyk? Czy mogę przetestować bez wyboru modelu?
3. **Newsletter** — gdzie jest?

## Moncredo.pl (Mon Credo - perfumeria)
1. **Czy konto l.tumiel@auroracreation.com istnieje na moncredo?**
2. **Jaki produkt użyć do testów?** (jakiś tani perfum/próbka?)
3. **Jaka kategoria do testów?** (np. /perfumy-damskie?)
4. **Newsletter** — gdzie jest?

## Ogólne
1. **Czy na któryś z projektów jest staging/testowe środowisko?** (bez reCAPTCHA, bez realnych zamówień)
2. **Czy mogę bezpiecznie przejść przez checkout (bez składania zamówienia)?** — chcę przetestować formularz wysyłki bez finalizacji
3. **Czy masz dostęp do Magento Admin** na którymkolwiek projekcie? (do wyłączenia reCAPTCHA, dodania testowego konta)
