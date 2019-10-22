import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from "@microsoft/sp-webpart-base";
import { escape } from "@microsoft/sp-lodash-subset";

import styles from "./CaseSearchWebPart.module.scss";
import * as strings from "CaseSearchWebPartStrings";
import { HttpClientResponse, HttpClient } from "@microsoft/sp-http";
export interface ICaseSearchWebPartProps {
  description: string;
}

export default class CaseSearchWebPart extends BaseClientSideWebPart<ICaseSearchWebPartProps> {

  /**
   * Gets case information from courtlistener and returns the completed promise
   */
  private _getCase = (case: string): Promise<any> => {
    // let url = `https://developer.uspto.gov/ptab-api/decisions?patentNumber=${legislation}`;
    let url = `https://www.courtlistener.com/api/rest/v3/search/?q=${case}`;

    return this.context.httpClient.get(url, HttpClient.configurations.v1).then(
      (res: HttpClientResponse): Promise<any> => {
        return res.json();
      }
    );
  };

  /**
   * Renders important aspects of each case returned by courtlistener
   */
  private _renderCase(legislation: Array<any>): void {
    let html: string = "";
    legislation.forEach(entry => {
      html += `
         <h1> ${entry.caseName}</h1>
         <p>Date filed:${entry.dateFiled}</p>
           <p>Citation count:${entry.citeCount}</p>
           <p>Court:${entry.court}</p>
           </br>
         `;
    });
    const legislationContainer: Element = this.domElement.querySelector(
      "#legislationContainer"
    );
    legislationContainer.innerHTML = html;
  }

  /**
   * Complete function with promise and render
   */
  public _renderCaseAsync(): void {
    const value: string = (<HTMLInputElement>document.getElementById("case"))
      .value;
    this._getCase(value).then(response => {
      console.log(response);
      this._renderCase(response.results);
    });
  }

  /**
   * Adds renderCase functionality to form button
   */
  private _setButtonEventHandlers(): void {
    const webPart: CaseSearchWebPart = this;
    this.domElement.querySelector("#submit").addEventListener("click", () => {
      this._renderCaseAsync();
    });
  }

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${styles.caseSearch}">
      <div class="${styles.container}">
          <div class="${styles.row}">
            <div class="${styles.column}">
            <h1 class="${styles.title}">
            Search Court Cases
            </h1>
            <form class="${styles.form}" id="legislationForm">
              <input class="${styles.input}" placeholder="Court Case" type="text" id="case"/>
              <button class="${styles.button}" type="submit" id="submit"> Search</button>
            <form>
            </div>
          </div>
          <div id="legislationContainer" class=${styles.lawContainer} />
        </div>
      </div>`;

    document
      .getElementById("legislationForm")
      .addEventListener("click", function(event) {
        event.preventDefault();
      });
    this._setButtonEventHandlers();
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
