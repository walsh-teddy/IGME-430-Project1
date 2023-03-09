const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" 
  integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" 
  crossorigin="anonymous" referrerpolicy="no-referrer"
/>
<div class="hero-footer box has-background-dark has-text-grey">
</div>
`;

// YOUR CODE GOES HERE
class CustomFooter extends HTMLElement{
    constructor(){
        super();

        // Attatch a shadow DOM tree to this instance. This creates a shadow root for us
        this.attachShadow({mode: "open"});

        // Create the span element and add it to the shadow dom
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // This line of code will create an property named `span` for us, so that we don't have to keep calling this.shadowRoot.querySelector("span");
        this.div = this.shadowRoot.querySelector("div");
    }

    // Watch the 2 data attributes
    static get observedAttributes()
    {
        return ["data-name", "data-organization", "data-year", "data-link"];
    }

    attributeChangedCallback(attributeName, oldVal, newVal)
    {
        console.log(attributeName, oldVal, newVal);
        this.render();
    }

    // Called when the component is added to the page
    connectedCallback()
    {
        this.render();
    }

    disconnectedCallback(){}

    // A helper method to display the values of the attributes
    render()
    {
        const name = this.getAttribute('data-name') ? this.getAttribute('data-name') : "Teddy Walsh";
        const organization = this.getAttribute('data-organization') ? this.getAttribute('data-organization') : "Rochester Institute of Technology";
        const year = this.getAttribute('data-year') ? this.getAttribute('data-year') : "2022";
        const link= this.getAttribute('data-link') ? this.getAttribute('data-link') : "https://people.rit.edu/tjw6911/";

        this.div.innerHTML = `${name} - ${organization} - ${year} <br>
        <a href="${link}">More of me <i class="fas fa-smile-beam"></i></a>`;
    }
} 

customElements.define('custom-footer', CustomFooter);